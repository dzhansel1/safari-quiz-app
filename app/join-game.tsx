import {
	query,
	where,
	getDocs,
	updateDoc,
	collection,
} from '@firebase/firestore';
import {
	Text,
	View,
	Animated,
	Keyboard,
	StyleSheet,
	NativeSyntheticEvent,
	TextInputChangeEventData,
} from 'react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useEffect, useState } from 'react';
import { ROUTES } from './interfaces/routes';
import { firestore } from './config/initFirebase';
import IntroWrapper from '@/components/IntroWrapper';
import { GAME_STATUS, IQuiz } from '@/utils/createQuiz';
import { useQuizContext } from '@/contexts/quiz.context';
import { useLocationContext } from '@/contexts/location.context';
import { loginAndSetUsername } from '@/utils/loginAndSetUsername';
import { useTranslateYAnimation } from './hooks/useTranslateYAnimation';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const joinGame = () => {
	const { setCode } = useQuizContext();
	const { setLocation } = useLocationContext();
	const [value, setValue] = useState<string>('');
	const { openModal, setErrorMessage } = useModalsContext();
	const { translateY, animateTranslateY } = useTranslateYAnimation();

	useEffect(() => {
		setLocation(ROUTES.JOIN_GAME);
	}, []);

	useEffect(() => {
		//add keyboard listeners for keyboard appearing
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

	const onChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
		setValue(e.nativeEvent.text);
	};

	const joinGame = async () => {
		if (!value) {
			setErrorMessage('Моля въведи код на играта!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}
		//set the code inside the context, trigger fetching of the game and redirect
		// CASE WHERE USER IS JOINING GAME
		const q = query(
			collection(firestore, 'quizzes'),
			where('code', '==', value)
		);

		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			setErrorMessage('Играта не съществува!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}

		const quizDoc = querySnapshot.docs[0];

		//cannot join a game if its already locked (solo game / already started game)
		const quizData = quizDoc.data() as IQuiz;
		if (quizData.status !== GAME_STATUS.AWAITING || quizData.isLocked) {
			setErrorMessage('Играта е заключена');
			openModal(MODAL_TYPES.ERROR);
			return;
		}

		//create a nameless user and add it to the game. Will add the username on the next view (create-player)
		const currentUser = await loginAndSetUsername('');

		//add the user to the game and redirect to lobby
		await updateDoc(quizDoc.ref, {
			players: [
				...quizData.players,
				{
					points: 0,
					username: '',
					uid: currentUser.uid,
				},
			],
		});
		setCode(value);
	};

	return (
		<IntroWrapper>
			<Animated.View
				style={[
					styles.optionsContainer,
					{ transform: [{ translateY: translateY }] },
				]}
			>
				<View style={styles.optionsContainer}>
					<Text style={styles.label}>Въведи код на играта:</Text>
					<Input value={value} onChange={onChange} />
					<Button
						text="ПРИСЪЕДИНИ СЕ"
						handler={joinGame}
						backgroundColor="green"
					/>
				</View>
			</Animated.View>
		</IntroWrapper>
	);
};

export default joinGame;

const styles = StyleSheet.create({
	optionsContainer: {
		gap: 32,
		width: '100%',
		display: 'flex',
		backgroundColor: 'transparent',
	},
	label: {
		fontSize: 24,
		alignSelf: 'center',
	},
});
