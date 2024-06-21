import {
	Text,
	Animated,
	Keyboard,
	StyleSheet,
	NativeSyntheticEvent,
	TextInputChangeEventData,
	View,
	ActivityIndicator,
} from 'react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useEffect, useState } from 'react';
import { ROUTES } from './interfaces/routes';
import { updateDoc } from 'firebase/firestore';
import IntroWrapper from '@/components/IntroWrapper';
import { useQuizContext } from '@/contexts/quiz.context';
import { ASYNC_DATA_KEYS } from './interfaces/async_storage';
import { User, getAuth, updateProfile } from 'firebase/auth';
import { useLocationContext } from '@/contexts/location.context';
import { loginAndSetUsername } from '@/utils/loginAndSetUsername';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPlayer, createQuiz, GAME_OPERATION } from '@/utils/createQuiz';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';
import { useTranslateYAnimation } from '@/app/hooks/useTranslateYAnimation';

const CreatePlayer = () => {
	const { setLocation } = useLocationContext();
	const { setCode, quizSnapshot } = useQuizContext();
	const [username, setUsername] = useState<string>('');
	const { openModal, setErrorMessage } = useModalsContext();
	const { translateY, animateTranslateY } = useTranslateYAnimation();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	//set last location marker to create player
	useEffect(() => {
		setLocation(ROUTES.CREATE_PLAYER);
	}, []);

	useEffect(() => {
		//add keyboard listeners for keyboard appearing and disappearing
		const keyboardWillShowListener = Keyboard.addListener(
			'keyboardWillShow',
			() => animateTranslateY(-220)
		);

		const keyboardWillHideListener = Keyboard.addListener(
			'keyboardWillHide',
			() => animateTranslateY(0)
		);

		return () => {
			keyboardWillShowListener.remove();
			keyboardWillHideListener.remove();
		};
	}, [translateY]);

	const changeHandler = async (
		e: NativeSyntheticEvent<TextInputChangeEventData>
	) => {
		//make sure no whitespace is entered and convert username to uppercase
		const text = e.nativeEvent.text.replace(/\s/g, '').toUpperCase();
		setUsername(text);
	};

	const joinLobby = async () => {
		setIsLoading(true);
		try {
			//get the previously set game operation from the async storage
			const gameOperation = await AsyncStorage.getItem(
				ASYNC_DATA_KEYS.GAME_OPERATION
			);

			if (!gameOperation) {
				throw new Error('Невалидна операция на играта!');
			}

			//check if username is present
			if (!username) {
				throw new Error('Моля въведи име на играч!');
			}

			if (gameOperation === GAME_OPERATION.CREATE) {
				// CASE WHERE USER IS CREATING A GAME
				await loginAndSetUsername(username);
				await createQuiz();
				const code = await AsyncStorage.getItem(
					ASYNC_DATA_KEYS.GAME_CODE
				);

				// set the code to trigger the QuizContext to fetch and try to connect to the game
				setCode(code as string);
			} else {
				// CASE WHERE USER IS JOINING GAME
				if (!quizSnapshot || !quizSnapshot.exists()) {
					throw new Error('Въпросникът не съществува!');
				}

				// check if player name is already in taken
				if (
					quizSnapshot
						.data()
						.players.some((p: IPlayer) => p.username === username)
				) {
					throw new Error('Името е вече заето!');
				}

				const auth = getAuth();

				if (!auth.currentUser) {
					throw new Error('Невалидна сесия! Моля опитайте отново!');
				}

				//update newly created user with the username entered by the player
				await updateProfile(auth.currentUser, {
					displayName: username,
				});

				//update the player's name in the game
				const players = quizSnapshot
					.data()
					.players.map((player: IPlayer) => {
						if (player.uid === (auth.currentUser as User).uid) {
							return {
								...player,
								username: (auth.currentUser as User)
									.displayName,
							};
						}
						return player;
					});

				await updateDoc(quizSnapshot.ref, { players });
			}
		} catch (err: any) {
			console.error(err);
			setErrorMessage(err.message);
			openModal(MODAL_TYPES.ERROR);
		}
		finally {
			setIsLoading(false)
		}
	};

	if (isLoading)
		return (
			<View style={styles.loadingBackground}>
				<ActivityIndicator size="large" color="green" />
			</View>
		);

	return (
		<IntroWrapper>
			<Animated.View
				style={[
					styles.optionsContainer,
					{ transform: [{ translateY: translateY }] },
				]}
			>
				<Text style={styles.message}>Въведи своето име:</Text>
				<Input value={username} onChange={changeHandler} />
				<Button
					text="СЪЗДАЙ"
					handler={joinLobby}
					backgroundColor="green"
				/>
			</Animated.View>
		</IntroWrapper>
	);
};

export default CreatePlayer;

const styles = StyleSheet.create({
	loadingBackground: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#DCFFC4',
	},
	message: {
		fontSize: 21,
		alignSelf: 'flex-start',
	},
	optionsContainer: {
		gap: 24,
		width: '100%',
		display: 'flex',
		alignItems: 'center',
	},
});
