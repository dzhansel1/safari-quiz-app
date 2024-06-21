import { useState } from 'react';
import Button from '@/components/Button';
import { useNavigation } from 'expo-router';
import { ROUTES } from './interfaces/routes';
import IntroWrapper from '@/components/IntroWrapper';
import { Picker } from '@react-native-picker/picker';
import { View, Text, StyleSheet } from 'react-native';
import { ASYNC_DATA_KEYS } from './interfaces/async_storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAME_DIFFICULTY, IGameParams, GAME_LENGTH } from '@/utils/createQuiz';

const configureGame = () => {
	const navigation = useNavigation();
	//one state variable that tracks changes to both game params
	const [params, setParams] = useState<IGameParams>({
		length: GAME_LENGTH.MEDIUM,
		difficulty: GAME_DIFFICULTY.MEDIUM,
	});

	//use one handler for both pickers
	const onParamChange = (
		key: keyof IGameParams,
		value: GAME_DIFFICULTY | GAME_LENGTH
	) => {
		setParams((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const setGameParams = async () => {
		//set the game params in async storage for later use and navigate to next view
		await AsyncStorage.setItem(
			ASYNC_DATA_KEYS.GAME_PARAMS,
			JSON.stringify(params)
		);
		navigation.reset({
			routes: [{ name: ROUTES.CREATE_PLAYER as never }],
		});
	};

	return (
		<IntroWrapper mini={true}>
			<View style={styles.optionsContainer}>
				<Text style={styles.label}>Избери трудност:</Text>
				<Picker
					selectedValue={params.difficulty}
					onValueChange={(value) =>
						onParamChange('difficulty', value)
					}
					placeholder="Избери трудност"
				>
					<Picker.Item label="Лесна" value={GAME_DIFFICULTY.EASY} />
					<Picker.Item
						label="Средна"
						value={GAME_DIFFICULTY.MEDIUM}
					/>
					<Picker.Item label="Трудна" value={GAME_DIFFICULTY.HARD} />
				</Picker>

				<Text style={styles.label}>Избери дължина:</Text>
				<Picker
					placeholder="Избери дължина"
					selectedValue={params.length}
					onValueChange={(value) => onParamChange('length', value)}
				>
					<Picker.Item
						label="Къса (5 въпроса)"
						value={GAME_LENGTH.SHORT}
					/>
					<Picker.Item
						label="Средна (10 въпроса)"
						value={GAME_LENGTH.MEDIUM}
					/>
					<Picker.Item
						label="Дълга (15 въпроса)"
						value={GAME_LENGTH.LONG}
					/>
				</Picker>
			</View>
			<Button
				text="ЗАПОЧНИ"
				backgroundColor="green"
				handler={setGameParams}
			/>
		</IntroWrapper>
	);
};

export default configureGame;

const styles = StyleSheet.create({
	label: {
		fontSize: 21,
	},
	optionsContainer: {
		width: '100%',
	},
});
