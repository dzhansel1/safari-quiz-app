import {
	query,
	where,
	getDocs,
	onSnapshot,
	collection,
	DocumentData,
	DocumentSnapshot,
} from 'firebase/firestore';
import { useNavigation } from 'expo-router';
import { ROUTES } from '@/app/interfaces/routes';
import { firestore } from '@/app/config/initFirebase';
import { GAME_STATUS, IQuiz } from '@/utils/createQuiz';
import { useLocationContext } from './location.context';
import { clearAsyncStorage } from '@/utils/clearAsyncStorage';
import { Unsubscribe, getAuth, signOut } from 'firebase/auth';
import { ASYNC_DATA_KEYS } from '@/app/interfaces/async_storage';
import { MODAL_TYPES, useModalsContext } from './modals.context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

//manage player location at all times using this context

export interface IQuizContext {
	clearQuizData(): void;
	quizCode: string | null;
	setCode: (code: string | null) => void;
	quizSnapshot: DocumentSnapshot<DocumentData, DocumentData> | null;
}

const QuizContext = createContext<IQuizContext>({
	quizCode: null,
	setCode: () => {},
	quizSnapshot: null,
	clearQuizData: () => {},
});

export const useQuizContext = () => useContext<IQuizContext>(QuizContext);

export const QuizContextProvider: React.FC<{
	children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
	const navigation = useNavigation();
	const { location } = useLocationContext();
	const { openModal, setErrorMessage } = useModalsContext();
	const [quizCode, setQuizCode] = useState<string | null>(null);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
	const [quizSnapshot, setQuizSnapshot] = useState<DocumentSnapshot<
		DocumentData,
		DocumentData
	> | null>(null);

	const setCode = (code: string | null) => {
		setQuizCode(code);
	};

	const clearQuizData = () => {
		setQuizCode(null);
		setErrorMessage('');
	};

	//if there is valid game data in async storage, load it
	useEffect(() => {
		const loadDataFromAsyncStorage = async () => {
			const gameCode = await AsyncStorage.getItem(
				ASYNC_DATA_KEYS.GAME_CODE
			);
			if (gameCode) {
				setCode(gameCode);
				return;
			}
		};

		loadDataFromAsyncStorage();
	}, []);

	useEffect(() => {
		if (!quizCode) {
			setQuizSnapshot(null); // Reset quizSnapshot if code is null
			return;
		}

		let unsubscribeFunc: Unsubscribe = () => {};

		const connectToQuiz = async () => {
			try {
				// form a query
				const q = query(
					collection(firestore, 'quizzes'),
					where('code', '==', quizCode)
				);

				//make a request to the database
				const snapshot = await getDocs(q);
				//check if there is a match
				if (snapshot.empty) {
					setErrorMessage('Играта не е намерена!');
					openModal(MODAL_TYPES.ERROR);
					setCode('');
					//dont navigate back if user is trying to join a game
					if (location === ROUTES.JOIN_GAME) return;

					setQuizSnapshot(null);
					await clearAsyncStorage();
					navigation.reset({
						routes: [{ name: ROUTES.HOME as never }],
					});
					return;
				}

				const gameData = snapshot.docs[0].data() as IQuiz;
				const isUserAlreadyInGame = gameData.players.some(
					(x) => x.uid === getAuth().currentUser?.uid
				);
				//prevent user from joining an already started game
				if (
					!isUserAlreadyInGame &&
					gameData.status !== GAME_STATUS.AWAITING
				) {
					setErrorMessage('Отборът е заключен!');
					openModal(MODAL_TYPES.ERROR);
					setQuizSnapshot(null);
					setCode('');
					return;
				}

				const gameRef = snapshot.docs[0].ref;
				await AsyncStorage.setItem(ASYNC_DATA_KEYS.GAME_CODE, quizCode);

				// Set unsubscribe function
				unsubscribeFunc = onSnapshot(gameRef, (doc) => {
					setQuizSnapshot(doc);
				});
			} catch (error) {
				setErrorMessage('Грешка при достъп на ресурс!');
			}
		};

		connectToQuiz();

		// Return a cleanup function
		return () => unsubscribeFunc();
	}, [quizCode]);

	//once quiz data is loaded player's location depends only on the game status and whether they have entered a player name
	useEffect(() => {
		if (isFirstRender) {
			setIsFirstRender(false);
			return;
		}

		let timeout: NodeJS.Timeout;

		const navigate = async () => {
			const auth = getAuth();

			if (!quizSnapshot || !quizSnapshot.exists()) {
				setQuizSnapshot(null);
				await signOut(auth);
				await clearAsyncStorage();
				setCode('');
				navigation.reset({
					routes: [{ name: ROUTES.HOME as never }],
				});
				return;
			}

			const data = quizSnapshot.data() as IQuiz;

			let href: string;
			//also depends on whether the user has logged in

			switch (data.status) {
				case GAME_STATUS.AWAITING:
					if (!auth.currentUser?.displayName) {
						href = ROUTES.CREATE_PLAYER;
						break;
					}
					href = ROUTES.LOBBY;
					break;
				case GAME_STATUS.RUNNING:
					if (!auth.currentUser?.displayName) {
						href = ROUTES.CREATE_PLAYER;
						break;
					}
					href = ROUTES.GAME_ROOM;
					break;
				case GAME_STATUS.COMPLETE:
					href = ROUTES.RESULT;
					break;
				case GAME_STATUS.QUIT:
					href = ROUTES.QUIT;
					break;
			}

			if (location === href) return;

			//if href result / quit set timeout with 1500ms ONLY if leaving from game room
			if (
				location === ROUTES.GAME_ROOM &&
				(href === ROUTES.RESULT || href === ROUTES.QUIT)
			) {
				timeout = setTimeout(() => {
					navigation.reset({
						routes: [{ name: href as never }],
					});
				}, 1500);

				return;
			}

			navigation.reset({
				routes: [{ name: href as never }],
			});
		};

		navigate();

		return () => clearTimeout(timeout);
	}, [quizSnapshot]);

	const data = {
		setCode,
		quizCode,
		quizSnapshot,
		clearQuizData,
	};

	return <QuizContext.Provider value={data}>{children}</QuizContext.Provider>;
};
