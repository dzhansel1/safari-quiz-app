import { useEffect } from 'react';
import Button from '@/components/Button';
import { useNavigation } from 'expo-router';
import { ROUTES } from './interfaces/routes';
import { GAME_OPERATION } from '@/utils/createQuiz';
import IntroWrapper from '@/components/IntroWrapper';
import { Text, View, StyleSheet } from 'react-native';
import { ASYNC_DATA_KEYS } from './interfaces/async_storage';
import { generateQuestions } from '@/utils/generateQuestions';
import { useLocationContext } from '@/contexts/location.context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const gameOperations = () => {
	const navigation = useNavigation();
	const { setLocation } = useLocationContext();

	//every view will set its own location as a marker (for keeping track of last user location)
	useEffect(() => {
		setLocation(ROUTES.HOME);
	}, []);

	const setGameOperation = async (operation: GAME_OPERATION) => {
		//set the game operation into the async storage for later use
		await AsyncStorage.setItem(ASYNC_DATA_KEYS.GAME_OPERATION, operation);
		//based on the passed game operation navigate to different view
		operation === GAME_OPERATION.CREATE
			? navigation.navigate(ROUTES.CHOOSE_GAMEMODE as never)
			: navigation.navigate(ROUTES.JOIN_GAME as never);
	};

	return (
		<IntroWrapper>
			<View style={styles.optionsContainer}>
				<Text style={styles.label}>Избери действие:</Text>
				<Button
					text="СЪЗДАЙ ИГРА"
					backgroundColor="green"
					handler={() => setGameOperation(GAME_OPERATION.CREATE)}
				/>
				<Button
					text="ПРИСЪЕДИНИ СЕ КЪМ ИГРА"
					backgroundColor="green"
					handler={() => setGameOperation(GAME_OPERATION.JOIN)}
				/>
				{/* <Button
					text="Генерирай въпроси"
					backgroundColor="green"
					handler={() => generateQuestions()}
				/> */}
			</View>
		</IntroWrapper>
	);
};

export default gameOperations;

const styles = StyleSheet.create({
	optionsContainer: {
		gap: 32,
		width: '100%',
		backgroundColor: 'transparent',
	},
	label: {
		fontSize: 24,
		alignSelf: 'center',
	},
});
