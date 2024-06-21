import { getAuth } from 'firebase/auth';
import Option from '@/components/Option';
import Button from '@/components/Button';
import { app } from './config/initFirebase';
import { useEffect, useState } from 'react';
import { ROUTES } from './interfaces/routes';
import { updateDoc } from 'firebase/firestore';
import { Text, View, StyleSheet } from 'react-native';
import { useQuizContext } from '@/contexts/quiz.context';
import { useLocationContext } from '@/contexts/location.context';
import { GAME_STATUS, IQuestion, IQuiz } from '@/utils/createQuiz';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const answerLetters = ['A', 'B', 'C', 'D'];

const gameRoom = () => {
	const { quizSnapshot } = useQuizContext();
	const { setLocation } = useLocationContext();
	const [answer, setAnswer] = useState<string>('');
	const { openModal, setErrorMessage } = useModalsContext();
	const [firstRender, setFirstRender] = useState<boolean>(true);
	const [question, setQuestion] = useState<IQuestion | null>(null);
	const [hasGameEnded, setHasGameEnded] = useState<boolean>(false);
	const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

	//set last location marker to game room
	useEffect(() => {
		setLocation(ROUTES.GAME_ROOM);
	}, []);

	useEffect(() => {
		if (!quizSnapshot || !quizSnapshot.exists()) {
			setErrorMessage('Въпросникът не съществува!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}

		//every time the quiz data changes, check if the game has ended
		const data = quizSnapshot.data() as IQuiz;
		if (data.status !== GAME_STATUS.RUNNING) {
			setIsAnswerSubmitted(true);
			setHasGameEnded(true);
			return;
		}

		//only on first render load the question here
		if (firstRender) {
			//load next question
			setQuestion(data.questions[data.currentQuestion]);
			setFirstRender(false);
			return;
		}

		const currentQuestionIndex = data.questions.findIndex(
			(x) => x.question === question!.question
		);

		let timeout: NodeJS.Timeout | (() => void) = () => {};

		//if true it means we have moved to the next question
		if (data.currentQuestion > currentQuestionIndex) {
			setIsAnswerSubmitted(true);
			//set a timeout of 1.5 seconds before going to the next question in order to show the correct answer to the user
			timeout = setTimeout(() => {
				//reset the answer and options statuses
				setAnswer('');
				setIsAnswerSubmitted(false);

				//load next question
				setQuestion(data.questions[data.currentQuestion]);
			}, 1500);
		} else {
			//instantly load the next question
			setQuestion(data.questions[data.currentQuestion]);
		}

		//clear the timeout
		return () => clearTimeout(timeout as NodeJS.Timeout);
	}, [quizSnapshot]);

	//when another user marks and answer update the marked answer to all other players
	useEffect(() => {
		if (firstRender) {
			setFirstRender(false);
			return;
		}

		if (!question || !quizSnapshot || !quizSnapshot.exists()) {
			setErrorMessage('Въпросникът не съществува!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}
		const { questions, currentQuestion } = quizSnapshot.data() as IQuiz;
		setAnswer(questions[currentQuestion].selected_option || '');
	}, [question]);

	//deselect all options and select the pressed option
	const selectAnswer = async (value: string) => {
		//if there is no quiz data, show an error message (redirection is automatically handled by the quiz context)
		if (!quizSnapshot || !quizSnapshot.exists()) {
			setErrorMessage('Въпросникът не съществува!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}

		const data = quizSnapshot.data() as IQuiz;

		//update the question selected answer
		const updatedQuestions = data.questions.map((question, i) => {
			if (i === data.currentQuestion) {
				return { ...question, selected_option: value };
			}
			return question;
		});

		await updateDoc(quizSnapshot.ref, {
			questions: updatedQuestions,
		});

		setAnswer(value);
	};

	const submitAnswer = async () => {
		if (isAnswerSubmitted) return; //prevent spamming answers after one has been already given
		if (!quizSnapshot || !quizSnapshot.exists()) {
			setErrorMessage('Въпросникът не съществува!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}

		if (!answer) {
			setErrorMessage('Нужен е отговор!');
			openModal(MODAL_TYPES.ERROR);
			return;
		}

		const question =
			quizSnapshot?.data().questions[
				quizSnapshot?.data().currentQuestion
			];

		const auth = getAuth(app);

		const { players, questions, currentQuestion, pointsPerQuestion } =
			quizSnapshot.data() as IQuiz;

		let updatedPlayers = players;

		if (answer === question.correct_answer) {
			//update the score if answer is correct
			updatedPlayers = updatedPlayers.map((player) => {
				if (auth.currentUser && player.uid === auth.currentUser.uid) {
					player.points += pointsPerQuestion;
				}
				return player;
			});
		}

		const updatedQuestions = questions.map((q, i) => {
			if (i === currentQuestion) {
				return {
					...q,
					is_answer_submitted: true,
				};
			}
			return q;
		});

		// check if current question is last in the quiz
		//if yes, then set the status to complete and completedAt to current date then redirect to result page
		//else just update the currentQuestion and redirect to the same view
		await updateDoc(quizSnapshot.ref, {
			players: updatedPlayers,
			questions: updatedQuestions,
			...(currentQuestion === questions.length - 1
				? {
						completedAt: new Date(),
						status: GAME_STATUS.COMPLETE,
				  }
				: {
						currentQuestion: currentQuestion + 1,
				  }),
		});
	};

	if (!question) {
		return <View style={styles.container}></View>;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{question.question}</Text>
			<View style={styles.optionsContainer}>
				{[...question.incorrect_answers, question.correct_answer]
					.sort((a, b) => a.localeCompare(b))
					.map((string, index) => {
						return (
							<Option
								key={string}
								text={string}
								answerLetter={answerLetters[index]}
								handler={() => selectAnswer(string)}
								isCorrect={question.correct_answer === string}
								isSelected={question.selected_option === string}
								disabled={question.disabled_answers.some(
									(x) => x === string
								)}
								isAnswerSubmitted={
									isAnswerSubmitted || hasGameEnded
								}
							/>
						);
					})}
			</View>
			<Button
				text="ОТГОВОРИ"
				handler={submitAnswer}
				backgroundColor="green"
			/>
		</View>
	);
};

export default gameRoom;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		paddingHorizontal: 32,
		flexDirection: 'column',
		backgroundColor: '#DCFFC4',
		justifyContent: 'space-evenly',
	},
	loadingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 28,
		color: 'black',
		fontWeight: '700',
		letterSpacing: 1.1,
		alignSelf: 'flex-start',
	},
	optionsContainer: {
		gap: 16,
		width: '100%',
		display: 'flex',
		backgroundColor: 'transparent',
	},
});
