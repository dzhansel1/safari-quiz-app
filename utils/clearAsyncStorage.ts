import { ASYNC_DATA_KEYS } from '@/app/interfaces/async_storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

//USE ONLY THIS FUNCTION FOR CLEARINT THE STORAGE (THERE ARE OTHER VALUES THAT MUST NOT BE ERASED BY US)
export const clearAsyncStorage = async () => {
	await AsyncStorage.removeItem(ASYNC_DATA_KEYS.GAME_CODE);
	await AsyncStorage.removeItem(ASYNC_DATA_KEYS.GAME_MODE);
	await AsyncStorage.removeItem(ASYNC_DATA_KEYS.GAME_PARAMS);
	await AsyncStorage.removeItem(ASYNC_DATA_KEYS.GAME_OPERATION);
};
