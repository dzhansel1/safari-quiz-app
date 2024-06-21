import {
	View,
	Animated,
	Keyboard,
	StyleSheet,
	ImageURISource,
} from 'react-native';
import { useAssets } from 'expo-asset';
import React, { useEffect } from 'react';
import { useTranslateYAnimation } from '../app/hooks/useTranslateYAnimation';

interface IIntroProps {
	mini?: boolean;
	children: React.ReactNode[] | React.ReactNode;
}

const IntroWrapper = ({ mini = false, children }: IIntroProps) => {
	const { translateY, animateTranslateY } = useTranslateYAnimation();
	const [assets] = useAssets([
		require('../assets/images/logo.png'),
		require('../assets/images/logo-mini.png'),
	]);

	useEffect(() => {
		//add keyboard listeners for keyboard appearing
		const keyboardWillShowListener = Keyboard.addListener(
			'keyboardWillShow',
			() => animateTranslateY(-100)
		);

		const keyboardWillHideListener = Keyboard.addListener(
			'keyboardWillHide',
			() => animateTranslateY(0)
		);

		return () => {
			keyboardWillShowListener.remove();
			keyboardWillHideListener.remove();
		};
	}, [translateY]);

	return (
		<View style={styles.background}>
			{assets && (
				<Animated.Image
					source={
						mini
							? (assets[1] as ImageURISource)
							: (assets[0] as ImageURISource)
					}
					style={[
						styles.logo,
						{ transform: [{ translateY: translateY }] },
					]}
				/>
			)}
			{children}
		</View>
	);
};

export default IntroWrapper;

const styles = StyleSheet.create({
	background: {
		flex: 1,
		padding: 32,
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		backgroundColor: '#DCFFC4',
		justifyContent: 'space-evenly',
	},

	logo: {
		width: '60%',
		objectFit: 'contain',
	},
});
