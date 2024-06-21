import { Animated } from 'react-native';
import { useRef, useEffect } from 'react';

export const useTranslateYAnimation = (initialValue = 0) => {
	const translateY = useRef(new Animated.Value(initialValue)).current;

	const animateTranslateY = (toValue: number, duration = 250) => {
		Animated.timing(translateY, {
			toValue: toValue,
			duration: duration,
			useNativeDriver: true,
		}).start();
	};

	useEffect(() => {
		animateTranslateY(0); // Start animation when component mounts
	}, []); // Only run once when component mounts

	return { translateY, animateTranslateY };
};
