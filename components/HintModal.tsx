import Button from './Button';
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { updateDoc } from 'firebase/firestore';
import { app } from '@/app/config/initFirebase';
import { IPenalty, IQuiz } from '@/utils/createQuiz';
import { ModalText, ModalWrapper } from './ModalWrapper';
import { useQuizContext } from '@/contexts/quiz.context';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const HintModal = () => {
	const { quizSnapshot } = useQuizContext();
	const { closeModal } = useModalsContext();
	const [isDisabled, setIsDisabled] = useState(false);
	const [penaltyPoints, setPenaltyPoints] = useState(0);

	useEffect(() => {
		if (!quizSnapshot || !quizSnapshot.exists()) {
			closeModal(MODAL_TYPES.HINT);
			return;
		}

		const data = quizSnapshot.data() as IQuiz;
		const currentQuestion = data.questions[data.currentQuestion];
		setIsDisabled(currentQuestion.disabled_answers.length > 0);
		setPenaltyPoints(data.penaltyPoints);
	}, [quizSnapshot]);

	const hideModal = () => {
		closeModal(MODAL_TYPES.HINT);
	};

	const openHint = async () => {
		const auth = getAuth(app);
		if (
			!auth ||
			isDisabled ||
			!quizSnapshot ||
			!auth.currentUser ||
			!quizSnapshot.exists()
		)
			return;
		const data = quizSnapshot.data() as IQuiz;

		const updatedQuestions = data.questions.map((question, i) => {
			if (i === data.currentQuestion) {
				return {
					...question,
					disabled_answers: question.incorrect_answers.slice(0, 2),
				};
			}
			return question;
		});

		await updateDoc(quizSnapshot.ref, {
			penalties: [
				...data.penalties,
				{
					openedBy: auth.currentUser.uid,
					questionIndex: data.currentQuestion,
				} as IPenalty,
			],
			questions: updatedQuestions,
		});

		hideModal();
	};

	return (
		<ModalWrapper
			Message={
				<ModalText
					text={`Сигурен ли си че искаш да използваш жокер 50/50? Тази операция ще добави ${penaltyPoints} наказателни точки.`}
				/>
			}
			Confirm={
				<Button
					text="ИЗПОЛЗВАЙ ЖОКЕР"
					handler={openHint}
					backgroundColor={isDisabled ? 'grey' : 'red'}
				/>
			}
			Cancel={
				<Button
					text="ОТМЕНИ"
					handler={hideModal}
					backgroundColor="green"
				/>
			}
		/>
	);
};

export default HintModal;
