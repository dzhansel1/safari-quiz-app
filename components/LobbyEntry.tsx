import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ILobbyEntryProps {
	index?: number;
	points?: number;
	penalty?: number;
	username: string;
}

const LobbyEntry = ({ username, index, points, penalty }: ILobbyEntryProps) => {
	return (
		<View style={styles.entry}>
			<View style={styles.left}>
				{index && <Text style={styles.index}>{index}.</Text>}
				<View style={styles.initialBackground}>
					<Text style={styles.initial}>
						{username[0].toUpperCase()}
					</Text>
				</View>
				<Text style={styles.username}>{username}</Text>
			</View>
			{points !== undefined && (
				<Text style={styles.points}>
					{points > 0 ? points : 0} (-{penalty || 0}) pts.
				</Text>
			)}
		</View>
	);
};

export default LobbyEntry;

const styles = StyleSheet.create({
	entry: {
		borderWidth: 1,
		borderColor: 'darkgreen',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 9,
		paddingHorizontal: 16,
		marginBottom: 9,
		borderRadius: 12,
		backgroundColor: 'green',
	},
	left: {
		gap: 16,
		flexDirection: 'row',
		alignItems: 'center',
		display: 'flex',
	},
	index: {
		fontSize: 16,
		color: 'white',
		fontWeight: '500',
	},
	initialBackground: {
		width: 36,
		height: 36,
		borderRadius: 50,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'darkgreen',
	},
	initial: {
		fontSize: 18,
		fontWeight: '600',
		color: 'white',
		textAlign: 'center', // Center the text horizontally
		lineHeight: 36, // Center the text vertically
	},
	username: {
		fontSize: 18,
		color: 'white',
		fontWeight: '500',
	},
	points: {
		fontSize: 16,
		color: 'white',
		fontWeight: '500',
	},
});
