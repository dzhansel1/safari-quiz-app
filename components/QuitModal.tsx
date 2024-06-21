import Button from './Button';
import { getAuth } from 'firebase/auth';
import React, { useEffect } from 'react';
import { app } from '@/app/config/initFirebase';
import { GAME_STATUS } from '@/utils/createQuiz';
import { ModalText, ModalWrapper } from './ModalWrapper';
import { useQuizContext } from '@/contexts/quiz.context';
import { Timestamp, updateDoc } from 'firebase/firestore';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const QuitModal = () => {
	const { closeModal } = useModalsContext();
	const { quizSnapshot } = useQuizContext();
	const [isFirstRender, setIsFirstRender] = React.useState<boolean>(true);
	useEffect(() => {
		if (isFirstRender) {
			setIsFirstRender(false);
			return;
		}
		if (!quizSnapshot || !quizSnapshot.exists()) {
			closeModal(MODAL_TYPES.QUIT);
			return;
		}
	}, [quizSnapshot]);

	const quit = async () => {
		const auth = getAuth(app);
		if (!auth.currentUser || !quizSnapshot || !quizSnapshot.exists())
			return;
		try {
			await updateDoc(quizSnapshot.ref, {
				status: GAME_STATUS.QUIT,
				completedAt: Timestamp.now(),
			});
			closeModal(MODAL_TYPES.QUIT);
		} catch (err: any) {
			console.log(err.message);
		}
	};

	const hideModal = () => {
		closeModal(MODAL_TYPES.QUIT);
	};

	return (
		<ModalWrapper
			Message={<ModalText text="Сигурен ли си че искаш да напуснеш играта?" />}
			Confirm={
				<Button text="НАПУСНИ" handler={quit} backgroundColor="red" />
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

export default QuitModal;
