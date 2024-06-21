import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface IModalWrapperProps {
	Cancel?: React.ReactNode;
	Message: React.ReactNode;
	Confirm?: React.ReactNode;
}

export const ModalWrapper = ({
	Cancel,
	Confirm,
	Message,
}: IModalWrapperProps) => {
	return (
		<View style={styles.modal}>
			<View style={styles.content}>
				{Message}
				<View style={styles.operationsContainer}>
					{Confirm}
					{Cancel}
				</View>
			</View>
		</View>
	);
};

export const ModalText = ({ text }: { text: string }) => {
	return <Text style={styles.message}>{text}</Text>;
};

const styles = StyleSheet.create({
	modal: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	content: {
		gap: 32,
		padding: 32,
		width: '90%',
		paddingTop: 64,
		borderWidth: 3,
		borderRadius: 12,
		flexDirection: 'column',
		borderColor: 'darkgreen',
		backgroundColor: '#DCFFC4',
		justifyContent: 'space-between',
	},
	message: {
		fontSize: 21,
		fontWeight: '600',
		textAlign: 'center',
	},
	operationsContainer: {
		gap: 18,
		justifyContent: 'space-between',
	},
});
