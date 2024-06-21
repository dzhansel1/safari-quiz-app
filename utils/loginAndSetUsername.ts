import { app } from '@/app/config/initFirebase';
import { getAuth, signInAnonymously, updateProfile } from 'firebase/auth';

export const loginAndSetUsername = async (username: string) => {
	//get the current auth session
	const auth = getAuth(app);

	//if user is already logged in nothing will happen
	await signInAnonymously(auth);

	if (!auth.currentUser) {
		throw new Error('Could not login.');
	}

	//set username after successful registration
	await updateProfile(auth.currentUser, {
		displayName: username,
	});

	return auth.currentUser;
};
