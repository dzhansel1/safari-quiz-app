import { QuizContextProvider } from '@/contexts/quiz.context';
import { ModalsContextProvider } from '@/contexts/modals.context';
import { LocationContextProvider } from '@/contexts/location.context';

interface IProviderProps {
	children: React.ReactNode | React.ReactNode[];
}

export const Provider = ({ children }: IProviderProps) => {
	return (
		<ModalsContextProvider>
			<LocationContextProvider>
				<QuizContextProvider>{children}</QuizContextProvider>
			</LocationContextProvider>
		</ModalsContextProvider>
	);
};
