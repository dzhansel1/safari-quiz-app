import { ROUTES } from '@/app/interfaces/routes';
import React, { createContext, useContext, useState } from 'react';

//context will be used to keep track of the last location of the user

export interface ILocationContext {
	location: string;
	setLocation: React.Dispatch<React.SetStateAction<string>>;
}

const LocationContext = createContext<ILocationContext>({
	location: ROUTES.HOME,
	setLocation: () => {},
});

export const useLocationContext = () =>
	useContext<ILocationContext>(LocationContext);

export const LocationContextProvider: React.FC<{
	children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
	const [location, setLocation] = useState<string>(ROUTES.HOME);
	const data = {
		location,
		setLocation,
	};

	return (
		<LocationContext.Provider value={data}>
			{children}
		</LocationContext.Provider>
	);
};
