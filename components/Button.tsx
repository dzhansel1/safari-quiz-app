import React from 'react';
import { Text, StyleSheet, Pressable, Animated } from 'react-native';

interface IButtonProps {
	text: string;
	handler?: () => void;
	backgroundColor: string;
}

const Button = ({
	text,
	backgroundColor,
	handler = () => {},
}: IButtonProps) => {
	const inputRange = [0, 1];
	const outputRange = [1, 0.95];
	const animation = new Animated.Value(0);
	const scale = animation.interpolate({ inputRange, outputRange });

	const onPressIn = () => {
		Animated.timing(animation, {
			toValue: 1,
			duration: 250,
			useNativeDriver: true,
		}).start();
	};

	const onPressOut = () => {
		Animated.timing(animation, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
	};

	return (
		<Animated.View style={{ width: '100%', transform: [{ scale }] }}>
			<Pressable
				onPress={handler}
				onPressIn={onPressIn}
				onPressOut={onPressOut}
				style={[styles.button, { backgroundColor }]}
			>
				<Text style={styles.buttonText}>{text}</Text>
			</Pressable>
		</Animated.View>
	);
};

export default Button;

const styles = StyleSheet.create({
	button: {
		width: '100%',
		borderRadius: 9,
		display: 'flex',
		paddingVertical: 16,
		alignItems: 'center',
	},
	buttonText: {
		fontSize: 18,
		color: 'white',
		fontWeight: '600',
	},
});
