import React, { createContext, useContext, useState } from 'react';

//manage modal states from this context

export enum MODAL_TYPES {
	QUIT = 'QUIT',
	HINT = 'HINT',
	ERROR = 'ERROR',
}

interface IModalsState {
	QUIT: boolean;
	HINT: boolean;
	ERROR: boolean;
}

export interface IModalsContext {
	errorMessage: string;
	modalsState: IModalsState;
	openModal(modal: MODAL_TYPES): void;
	closeModal(modal: MODAL_TYPES): void;
	setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ModalsContext = createContext<IModalsContext>({
	modalsState: {
		HINT: false,
		QUIT: false,
		ERROR: false,
	},
	errorMessage: '',
	openModal: () => {},
	closeModal: () => {},
	setErrorMessage: () => {},
});

export const useModalsContext = () => useContext<IModalsContext>(ModalsContext);

export const ModalsContextProvider: React.FC<{
	children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [modalsState, setModalsState] = useState<IModalsState>({
		QUIT: false,
		HINT: false,
		ERROR: false,
	});

	const openModal = (modal: MODAL_TYPES) => {
		setModalsState((prev) => ({ ...prev, [modal]: true }));
	};

	const closeModal = (modal: MODAL_TYPES) => {
		setModalsState((prev) => ({ ...prev, [modal]: false }));
	};

	const data = {
		openModal,
		closeModal,
		modalsState,
		errorMessage,
		setErrorMessage,
	};

	return (
		<ModalsContext.Provider value={data}>{children}</ModalsContext.Provider>
	);
};
