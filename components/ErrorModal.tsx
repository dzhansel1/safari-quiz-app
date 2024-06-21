import React from 'react';
import Button from './Button';
import { ModalText, ModalWrapper } from './ModalWrapper';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const ErrorModal = () => {
	const { closeModal, errorMessage } = useModalsContext();

	const hideModal = () => {
		closeModal(MODAL_TYPES.ERROR);
	};

	return (
		<ModalWrapper
			Message={
				<ModalText
					text={
						errorMessage ||
						'Something went wrong. Please try again.'
					}
				/>
			}
			Cancel={
				<Button text="OK" handler={hideModal} backgroundColor="green" />
			}
		/>
	);
};

export default ErrorModal;
