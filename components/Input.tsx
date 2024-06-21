import {
	TextInput,
	StyleSheet,
	NativeSyntheticEvent,
	TextInputChangeEventData,
} from 'react-native';

interface IInputProps {
	value: string;
	onChange: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void;
}

const Input = ({ value, onChange }: IInputProps) => {
	return (
		<TextInput
			value={value}
			onChange={onChange}
			style={styles.input}
			autoCapitalize="characters"
		/>
	);
};

export default Input;

const styles = StyleSheet.create({
	input: {
		padding: 12,
		fontSize: 21,
		width: '100%',
		borderRadius: 8,
		fontWeight: '500',
		textAlign: 'center',
		borderWidth:1,
		borderColor: 'darkgreen',
		backgroundColor: 'white',
		textTransform: 'uppercase',
	},
});
