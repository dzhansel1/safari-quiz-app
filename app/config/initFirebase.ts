// Import the functions you need from the SDKs you need
import {
	initializeAuth,
	connectAuthEmulator,
	getReactNativePersistence,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	appId: process.env.EXPO_PUBLIC_APP_ID,
	apiKey: process.env.EXPO_PUBLIC_API_KEY,
	projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
	authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
	storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
	measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
	messagingSenderId: process.env.EXPO_PUBLIC_MESSAGIN_SENDER_ID,
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore and connect to emulator
export const firestore = getFirestore(app);

// Initialize Authentication, connect to emulator and use AsyncStorage for persistence
const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});


// if (Platform.OS === 'android') {
// 	connectFirestoreEmulator(firestore, '10.0.2.2', 8080);
// 	connectAuthEmulator(auth, 'http://10.0.2.2:9099');
// } else {
// 	console.log('connecting firebase emulators');
// 	connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
// 	connectAuthEmulator(auth, 'http://localhost:9099');
// }
