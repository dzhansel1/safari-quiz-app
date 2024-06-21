import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Modal } from 'react-native';
import QuitModal from '@/components/QuitModal';
import HintModal from '@/components/HintModal';
import { Provider } from '@/components/Provider';
import HeaderLeft from '@/components/HeaderLeft';
import ErrorModal from '@/components/ErrorModal';
import HeaderRight from '@/components/HeaderRight';
import * as SplashScreen from 'expo-splash-screen';
import { useModalsContext } from '@/contexts/modals.context';

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	//hide the splash screen after the app is loaded
	useEffect(() => {
		SplashScreen.hideAsync();
	}, []);

	return (
		//Provider (containing contexts) wraps the RootLayoutNav component
		<Provider>
			<RootLayoutNav />
		</Provider>
	);
}

function RootLayoutNav() {
	const { modalsState } = useModalsContext();

	return (
		<>
			{/* Modal rendering will happen here */}
			{/* If any of the modal states is true render the outer "Modal" component */}
			{Array.from(Object.values(modalsState)).some((x) => x === true) && (
				<Modal transparent={true} animationType="fade">
					{/* depending on which state is true - open the corresponding modal */}
					{modalsState.QUIT && <QuitModal />}
					{modalsState.ERROR && <ErrorModal />}
					{modalsState.HINT && <HintModal />}
				</Modal>
			)}

			{/* Define stack screens (views) here */}
			<Stack
				screenOptions={{
					headerShown: true,
					headerTintColor: 'white',
					headerTitle: 'Safari Quiz',
					headerStyle: { backgroundColor: 'darkgreen' },
				}}
			>
				<Stack.Screen
					name="index"
					options={{
						headerTitle: 'Нач. екран',
						headerTitleAlign: 'center',
					}}
				/>
				<Stack.Screen
					name="join-game"
					options={{
						headerTitle: 'Присъедини се към игра',
						headerTitleAlign: 'center',
					}}
				/>
				<Stack.Screen
					name="choose-gamemode"
					options={{
						headerTitle: 'Реж. на игра',
						headerTitleAlign: 'center',
					}}
				/>
				<Stack.Screen
					name="configure-game"
					options={{
						headerTitle: 'Настройки',
						headerTitleAlign: 'center',
					}}
				/>
				<Stack.Screen
					name="create-player"
					options={{
						headerTitleAlign: 'center',
						headerTitle: 'Създай играч',
					}}
				/>
				<Stack.Screen
					name="lobby"
					options={{
						headerTitle: 'Лоби',
						headerLeft: HeaderLeft,
						headerTitleAlign: 'center',
					}}
				/>
				<Stack.Screen
					name="game-room"
					options={{
						//HeaderLeft == quit button
						//HeaderRight == hint button
						headerLeft: HeaderLeft,
						headerRight: HeaderRight,
						headerTitleAlign: 'center',
						headerTitle: 'Игрална стая',
					}}
				/>
				<Stack.Screen
					name="result"
					options={{
						headerTitleAlign: 'center',
						headerTitle: 'Класиране',
					}}
				/>
				<Stack.Screen
					name="quit"
					options={{
						headerTitle: 'Напусни',
						headerTitleAlign: 'center',
					}}
				/>
			</Stack>
		</>
	);
}
