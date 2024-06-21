import Button from '@/components/Button';
import { useEffect, useState } from 'react';
import { ROUTES } from './interfaces/routes';
import { StyleSheet, Text } from 'react-native';
import IntroWrapper from '@/components/IntroWrapper';
import { useQuizContext } from '@/contexts/quiz.context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocationContext } from '@/contexts/location.context';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const quit = () => {
	const { closeModal } = useModalsContext();
	const { clearQuizData } = useQuizContext();
	const { setLocation } = useLocationContext();
	const [seconds, setSeconds] = useState<number>(10);

	//close all types of modals at this point
	useEffect(() => {
		closeModal(MODAL_TYPES.HINT);
		closeModal(MODAL_TYPES.QUIT);
		setLocation(ROUTES.QUIT);
		const interval = setInterval(() => {
			setSeconds((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (seconds !== 0) return;
		clearQuizData();
	}, [seconds]);

	return (
		<IntroWrapper>
			<Text style={styles.title}>Напуснахте играта!</Text>
			<MaterialCommunityIcons
				size={128}
				color="darkgreen"
				name="emoticon-sad-outline"
			/>
			<Text style={styles.subtitle}>
				Ще бъдеш пренасочен към началния екран след: {seconds} сек.
			</Text>
			<Button
				text="КЪМ НАЧАЛНИЯ ЕКРАН"
				backgroundColor="green"
				handler={clearQuizData}
			/>
		</IntroWrapper>
	);
};

export default quit;

const styles = StyleSheet.create({
	title: {
		fontSize: 32,
		fontWeight: '600',
		color: 'darkgreen',
	},
	subtitle: {
		fontSize: 21,
		textAlign: 'center',
	},
});
