import { getAuth } from 'firebase/auth';
import Button from '@/components/Button';
import { useEffect, useState } from 'react';
import { ROUTES } from './interfaces/routes';
import { app } from '@/app/config/initFirebase';
import LobbyEntry from '@/components/LobbyEntry';
import IntroWrapper from '@/components/IntroWrapper';
import { useQuizContext } from '@/contexts/quiz.context';
import { Text, FlatList, StyleSheet } from 'react-native';
import { IPenalty, IPlayer, IQuiz } from '@/utils/createQuiz';
import { useLocationContext } from '@/contexts/location.context';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

interface IRenderItemProps {
	item: IPlayer;
	index: number;
}

interface ITimestamp {
	seconds: number;
	nanoseconds: number;
}

interface IDuration {
	hours: null | number;
	minutes: null | number;
}

const result = () => {
	const auth = getAuth(app);
	const { setLocation } = useLocationContext();
	const [penalty, setPenalty] = useState<number>(0);
	const [players, setPlayers] = useState<IPlayer[]>([]);
	const { quizSnapshot, clearQuizData } = useQuizContext();
	const [penalties, setPenalties] = useState<IPenalty[]>([]);
	const [isGoingHome, setIsGoingHome] = useState<boolean>(false);
	const { openModal, closeModal, setErrorMessage } = useModalsContext();
	const [duration, setDuration] = useState<IDuration>({
		hours: null,
		minutes: null,
	});

	//close all types of modals at this point
	useEffect(() => {
		closeModal(MODAL_TYPES.HINT);
		closeModal(MODAL_TYPES.QUIT);
		setLocation(ROUTES.RESULT);
	}, []);

	useEffect(() => {
		if (isGoingHome) return;

		if (!quizSnapshot || !quizSnapshot.exists()) {
			setErrorMessage('Въпросникът не съществува!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}

		const { players, penalties, penaltyPoints, startedAt, completedAt } =
			quizSnapshot.data() as IQuiz;
		//if joined user hasn't already entered a username, display 'JOINING...'
		const updatedPlayers = players.map((p) => {
			const username = p.username || 'ПРИСЪЕДИНЯВА СЕ...';
			return { ...p, username };
		});

		setPenalties(penalties);
		setPenalty(penaltyPoints);
		setPlayers(updatedPlayers);
		calcDuration(startedAt!, completedAt!);
	}, [quizSnapshot]);

	const calcDuration = (start: ITimestamp, end: ITimestamp) => {
		// Convert timestamps to milliseconds
		const startMilliseconds =
			start.seconds * 1000 + Math.round(start.nanoseconds / 1000000);
		const endMilliseconds =
			end.seconds * 1000 + Math.round(end.nanoseconds / 1000000);

		// Calculate the difference in milliseconds
		const differenceMilliseconds = Math.abs(
			endMilliseconds - startMilliseconds
		);

		// Convert milliseconds to hours and minutes
		const hours = Math.floor(differenceMilliseconds / (1000 * 60 * 60));
		const remainingMilliseconds = differenceMilliseconds % (1000 * 60 * 60);
		const minutes = Math.floor(remainingMilliseconds / (1000 * 60));

		setDuration({ hours, minutes });
	};

	const sortPlayers = (player1: IPlayer, player2: IPlayer) => {
		//sort players by their points AFTER deducting penalty points
		const player1PenaltyPoints = penalties.reduce((acc, pen) => {
			if (pen.openedBy === player1.uid) return acc + penalty;
			return acc;
		}, 0);

		const player2PenaltyPoints = penalties.reduce((acc, pen) => {
			if (pen.openedBy === player2.uid) return acc + penalty;
			return acc;
		}, 0);

		const player1Points = player1.points - player1PenaltyPoints;
		const player2Points = player2.points - player2PenaltyPoints;

		return player1Points > player2Points ? -1 : 1;
	};

	//render the leaderboard entries
	const renderItem = ({ item: player, index }: IRenderItemProps) => {
		const penaltyPts =
			penalties.filter((x) => x.openedBy === player.uid).length * penalty;

		const points = player.points - penaltyPts;
		return (
			<LobbyEntry
				points={points}
				index={index + 1}
				penalty={penaltyPts}
				username={
					auth.currentUser?.uid === player.uid
						? 'АЗ'
						: player.username
				}
			/>
		);
	};

	const goHome = () => {
		//prevents rendering of the error modal
		setIsGoingHome(true);
		clearQuizData();
	};

	return (
		<IntroWrapper>
			<Text style={styles.title}>
				Продължителност:{' '}
				<Text style={{ fontWeight: '800' }}>
					{(duration.hours || 0) < 10 && 0}
					{duration.hours || 0}Ч:{(duration.minutes || 0) < 10 && 0}
					{duration.minutes}М.
				</Text>
			</Text>
			<Text style={styles.title}>Класиране на играчите</Text>
			<FlatList
				style={styles.list}
				renderItem={renderItem}
				keyExtractor={(player) => player.uid}
				data={players.sort(sortPlayers)}
			/>
			<Button text="КЪМ НАЧАЛНИЯ ЕКРАН" handler={goHome} backgroundColor="green" />
		</IntroWrapper>
	);
};

export default result;

const styles = StyleSheet.create({
	title: {
		fontSize: 21,
		fontWeight: '500',
	},
	list: {
		padding: 12,
		width: '100%',
		borderRadius: 9,
		maxHeight: '35%',
		backgroundColor: 'white',
	},
});
