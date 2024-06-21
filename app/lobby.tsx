import {
	View,
	Text,
	FlatList,
	Animated,
	StyleSheet,
	ActivityIndicator,
} from 'react-native';
import { Redirect } from 'expo-router';
import Button from '@/components/Button';
import * as Clipboard from 'expo-clipboard';
import { ROUTES } from './interfaces/routes';
import { Ionicons } from '@expo/vector-icons';
import { updateDoc } from 'firebase/firestore';
import LobbyEntry from '@/components/LobbyEntry';
import React, { useEffect, useState } from 'react';
import IntroWrapper from '@/components/IntroWrapper';
import { GAME_STATUS, IQuiz } from '@/utils/createQuiz';
import { useQuizContext } from '@/contexts/quiz.context';
import { useLocationContext } from '@/contexts/location.context';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const Lobby = () => {
	const { quizSnapshot } = useQuizContext();
	const { setLocation } = useLocationContext();
	const [animation] = useState(new Animated.Value(0));
	const [quiz, setQuiz] = useState<IQuiz | null>(null);
	const { openModal, setErrorMessage } = useModalsContext();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [copySuccess, setCopySuccess] = useState<boolean>(false);

	//set last location marker to lobby
	useEffect(() => {
		setLocation(ROUTES.LOBBY);
	}, []);

	useEffect(() => {
		setIsLoading(true);
		if (!quizSnapshot || !quizSnapshot.exists()) {
			setErrorMessage('Quiz does not exist!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}
		const data = quizSnapshot.data() as IQuiz;
		const players = data.players.map((player) => {
			const username = player.username || 'ПРИСЪЕДИНЯВА СЕ...';
			return { ...player, username };
		});

		setQuiz({ ...data, players } as IQuiz);
		setIsLoading(false);
	}, [quizSnapshot]);

	useEffect(() => {
		if (!copySuccess) return;
		Animated.sequence([
			Animated.timing(animation, {
				toValue: 1,
				duration: 500, // Adjust duration for fade in
				useNativeDriver: true,
			}),
			Animated.delay(1500), // Delay before fading out
			Animated.timing(animation, {
				toValue: 0,
				duration: 500, // Adjust duration for fade out
				useNativeDriver: true,
			}),
		]).start(() => setCopySuccess(false));
	}, [copySuccess, animation]);

	const copyToClipboard = async () => {
		if (!quiz) return;
		//set the string in the phone's clipboard
		setCopySuccess(true);
		await Clipboard.setStringAsync(quiz.code);
	};

	const startGame = async () => {
		if (!quizSnapshot || !quizSnapshot.exists()) return;

		//update game state to running
		await updateDoc(quizSnapshot.ref, {
			isLocked: true,
			startedAt: new Date(),
			status: GAME_STATUS.RUNNING,
		});
	};

	//show a spinner while loading the data
	if (isLoading)
		return (
			<View style={styles.loadingBackground}>
				<ActivityIndicator size="large" color="green" />
			</View>
		);

	//shouldn't be possible to reach this point as quizContext will redirect if snapshot is null (its here only for typescript to be happy)
	if (!quiz) return <Redirect href={ROUTES.HOME as never} />;

	return (
		<IntroWrapper>
			<Animated.View style={[styles.successMsg, { opacity: animation }]}>
				<Text style={styles.successMsgText}>
					Кодът беше копиран!
				</Text>
			</Animated.View>
			{!quiz.isLocked && (
				<View style={styles.info}>
					<Text style={styles.subtitle}>
						Game Code:{' '}
						<Text style={{ fontWeight: '800' }}>{quiz.code}</Text>
					</Text>
					<Ionicons
						size={26}
						name="copy"
						color="darkgreen"
						onPress={copyToClipboard}
					/>
				</View>
			)}
			<Text style={styles.subtitle}>Играчи в лобито:</Text>
			<FlatList
				data={quiz.players}
				style={styles.list}
				keyExtractor={(item) => item.uid}
				renderItem={({ item }) => (
					<LobbyEntry username={item.username} />
				)}
			/>
			<Button
				text="СТАРТ"
				handler={startGame}
				backgroundColor="red"
			/>
		</IntroWrapper>
	);
};

export default Lobby;

const styles = StyleSheet.create({
	loadingBackground: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#DCFFC4',
	},
	successMsg: {
		top: '5%',
		opacity: 0,
		padding: 8,
		width: '100%',
		borderRadius: 9,
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'darkgreen',
	},
	successMsgText: {
		fontSize: 18,
		color: 'white',
	},
	info: {
		gap: 16,
		maxWidth: 264,
		width: '80%',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	subtitle: {
		fontSize: 24,
		fontWeight: '400',
	},
	list: {
		padding: 12,
		width: '100%',
		borderWidth: 3,
		borderRadius: 9,
		maxHeight: '35%',
		borderColor: 'green',
		backgroundColor: 'white',
	},
});
