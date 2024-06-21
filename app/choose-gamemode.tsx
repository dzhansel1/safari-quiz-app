import Button from '@/components/Button';
import { useNavigation } from 'expo-router';
import { ROUTES } from './interfaces/routes';
import { GAME_MODE } from '@/utils/createQuiz';
import IntroWrapper from '@/components/IntroWrapper';
import { Text, View, StyleSheet } from 'react-native';
import { ASYNC_DATA_KEYS } from './interfaces/async_storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const chooseGamemode = () => {
	const navigation = useNavigation();

	const setGameMode = async (gamemode: GAME_MODE) => {
		//set the gamemode in async storage for later use and navigate to next view
		await AsyncStorage.setItem(ASYNC_DATA_KEYS.GAME_MODE, gamemode);
		navigation.navigate(ROUTES.CONFIGURE_GAME as never);
	};

	return (
		<IntroWrapper>
			<View style={styles.optionsContainer}>
				<Text style={styles.label}>Избери режим на игра:</Text>
				<Button
					text="ИГРАЙ САМ"
					backgroundColor="green"
					handler={() => setGameMode(GAME_MODE.SOLO)}
				/>
				<Button
					text="ИГРАЙ В ОТБОР"
					backgroundColor="green"
					handler={() => setGameMode(GAME_MODE.MULTIPLAYER)}
				/>
			</View>
		</IntroWrapper>
	);
};

export default chooseGamemode;

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
