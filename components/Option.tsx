import React from 'react';
import { Platform } from 'expo-modules-core';
import { Text, Pressable, StyleSheet, Animated } from 'react-native';

interface IOptionProps {
	text: string;
	disabled: boolean;
	isCorrect: boolean;
	isSelected: boolean;
	handler: () => void;
	answerLetter: string;
	backgroundColor?: string;
	isAnswerSubmitted: boolean;
}

const Option = ({
	text,
	handler,
	disabled,
	isCorrect,
	isSelected,
	answerLetter,
	isAnswerSubmitted,
}: IOptionProps) => {
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
		<Animated.View style={{ transform: [{ scale }] }}>
			<Pressable
				style={[
					styles.option,
					Platform.OS === 'android' && styles.optionAndroid,
					disabled && styles.disabled,
					isSelected && styles.shrink,
					isAnswerSubmitted && {
						backgroundColor: isCorrect ? 'green' : 'red',
					},
				]}
				onPress={!disabled ? handler : () => {}}
				onPressIn={!disabled ? onPressIn : () => {}}
				onPressOut={!disabled ? onPressOut : () => {}}
			>
				<Text
					style={[
						styles.optionText,
						(isSelected || isAnswerSubmitted) && { color: 'white' },
					]}
				>
					{answerLetter}) {text}
				</Text>
			</Pressable>
		</Animated.View>
	);
};

export default Option;

const styles = StyleSheet.create({
	option: {
		elevation: 14,
		width: '100%',
		color: 'white',
		borderRadius: 9,
		display: 'flex',
		shadowRadius: 6,
		shadowOpacity: 20,
		shadowColor: 'grey',
		paddingHorizontal: 8,
		justifyContent: 'center',
		backgroundColor: 'white',
		shadowOffset: { width: 6, height: 6 },
	},
	optionAndroid: {
		shadowOpacity: 200,
		shadowColor: 'black',
		elevation: 8,
	},
	optionText: {
		padding: 21,
		fontSize: 18,
		color: 'black',
		fontWeight: '600',
	},
	disabled: {
		opacity: 0.5,
	},
	shrink: {
		backgroundColor: '#FF9A14',
		transform: [{ scale: 0.95 }],
	},
});
