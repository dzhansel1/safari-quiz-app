import {
	where,
	query,
	addDoc,
	getDocs,
	Timestamp,
	collection,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '@/app/config/initFirebase';
import { getAsyncStorageData } from './extractAsyncStorageData';
import { ASYNC_DATA_KEYS } from '@/app/interfaces/async_storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOTAL_POINTS = 1000;

export enum GAME_DIFFICULTY {
	HARD = 'HARD',
	EASY = 'EASY',
	MEDIUM = 'MEDIUM',
}

export enum GAME_OPERATION {
	JOIN = 'JOIN',
	CREATE = 'CREATE',
}

export enum GAME_LENGTH {
	LONG = 'LONG',
	SHORT = 'SHORT',
	MEDIUM = 'MEDIUM',
}

export interface IGameParams {
	length: GAME_LENGTH;
	difficulty: GAME_DIFFICULTY;
}

export enum GAME_STATUS {
	QUIT = 'QUIT',
	RUNNING = 'RUNNING',
	AWAITING = 'AWAITING',
	COMPLETE = 'COMPLETE',
}

export enum GAME_MODE {
	SOLO = 'SOLO',
	MULTIPLAYER = 'MULTIPLAYER',
}

export interface IPlayer {
	uid: string;
	points: number;
	username: string;
}

export interface IQuestion {
	question: string;
	correct_answer: string;
	disabled_answers: string[];
	incorrect_answers: string[];
	is_answer_submitted: boolean;
	selected_option: null | string;
}

export interface IPenalty {
	openedBy: string;
	questionIndex: number;
}

interface IQuizPayload {
	code: string;
	isLocked: boolean;
	status: GAME_STATUS;
	penaltyPoints: number;
	currentQuestion: number;
	pointsPerQuestion: number;
	startedAt: Timestamp | null;
	completedAt: Timestamp | null;
	players: IPlayer[];
	questions: IQuestion[];
	penalties: IPenalty[];
}

export interface IQuiz extends IQuizPayload {
	id: number;
}

interface IQueryParams {
	difficulty: string;
	questionsCount: number;
}

export const createQuiz = async () => {
	// Extract data from AsyncStorage
	const auth = getAuth();
	if (!auth.currentUser || !auth.currentUser.displayName) return;

	const localData = await getAsyncStorageData(ASYNC_DATA_KEYS.GAME_PARAMS);
	const gameMode = await getAsyncStorageData(ASYNC_DATA_KEYS.GAME_MODE);
	const gameParams = JSON.parse(localData) as IGameParams;

	let difficulty: string;
	let penaltyPoints: number;
	let questionsCount: number;

	switch (gameParams.length) {
		case GAME_LENGTH.SHORT:
			questionsCount = 5;
			break;
		case GAME_LENGTH.MEDIUM:
			questionsCount = 10;
			break;
		case GAME_LENGTH.LONG:
			questionsCount = 15;
			break;
	}

	switch (gameParams.difficulty) {
		case GAME_DIFFICULTY.EASY:
			difficulty = 'easy';
			penaltyPoints = Math.floor((TOTAL_POINTS / questionsCount) * 1.5);
			break;
		case GAME_DIFFICULTY.MEDIUM:
			difficulty = 'medium';
			penaltyPoints = Math.floor(TOTAL_POINTS / questionsCount);
			break;
		case GAME_DIFFICULTY.HARD:
			difficulty = 'hard';
			penaltyPoints = Math.floor((TOTAL_POINTS / questionsCount) * 0.5);
			break;
	}

	const q = query(
		collection(firestore, 'questions'),
		where('difficulty', '==', difficulty)
	);

	const res = await getDocs(q);
	const data = res.docs.map((doc) => doc.data());
	if (res.empty) {
		throw new Error('Error fetching data');
	}

	console.log(data.map((x) => [x.id, x.question]));
	const gameCode = await generateRandomSixDigitString();

	// shuffle the array, then slice it to get the required number of questions
	const questions = data
		.sort(() => Math.random() - 0.5)
		.slice(0, questionsCount)
		.map((question: any) => {
			return {
				...question,
				disabled_answers: [],
				selected_option: null,
				is_answer_submitted: false,
			} as IQuestion;
		});

	const payload: IQuizPayload = {
		questions,
		penalties: [],
		penaltyPoints,
		code: gameCode,
		startedAt: null,
		completedAt: null,
		currentQuestion: 0,
		status: GAME_STATUS.AWAITING,
		isLocked: gameMode === GAME_MODE.SOLO,
		pointsPerQuestion: Math.round(TOTAL_POINTS / questionsCount),
		players: [
			{
				points: 0,
				uid: auth.currentUser.uid,
				username: auth.currentUser.displayName,
			},
		],
	};

	await addDoc(collection(firestore, 'quizzes'), payload);
	await AsyncStorage.setItem(ASYNC_DATA_KEYS.GAME_CODE, gameCode);
};

async function generateRandomSixDigitString() {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	let isUnique = false;

	while (!isUnique) {
		result = '';

		// Generate a random character 6 times
		for (let i = 0; i < 6; i++) {
			// Get a random index from 0 to the length of the characters string
			const randomIndex = Math.floor(Math.random() * characters.length);
			// Append the character at the random index to the result
			result += characters.charAt(randomIndex);
		}

		const quizzesRef = collection(firestore, 'quizzes');
		const q = query(quizzesRef, where('code', '==', result));

		const snapshot = await getDocs(q);

		if (snapshot.docs.length === 0) {
			isUnique = true;
		}
	}

	return result;
}
