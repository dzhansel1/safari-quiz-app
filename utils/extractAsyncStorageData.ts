import AsyncStorage from '@react-native-async-storage/async-storage';

export const extractAsyncStorageData = async () => {
	try {
		// Get all keys stored in AsyncStorage
		const keys = await AsyncStorage.getAllKeys();

		// Retrieve all data corresponding to the keys
		const data = await AsyncStorage.multiGet(keys);

		// Data is returned as an array of arrays, each containing a key-value pair
		// You may want to map this data to a more usable format
		const formattedData = data.map(([key, value]) => ({
			[key]: value,
		}));

		// Return the formatted data
		return formattedData;
	} catch (error) {
		// Handle errors here
		console.error('Error retrieving data from AsyncStorage:', error);
		return [];
	}
};

export const getAsyncStorageData = async (key: string) => {
	return await AsyncStorage.getItem(key) || '';
};
