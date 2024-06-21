import { MaterialIcons } from '@expo/vector-icons';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const HeaderRight = () => {
	const { openModal } = useModalsContext();
	const showModal = (modalType: MODAL_TYPES) => {
		openModal(modalType);
	};

	return (
		<MaterialIcons
			size={28}
			color="#FFEF00"
			name="lightbulb-circle"
			suppressHighlighting={true}
			onPress={() => showModal(MODAL_TYPES.HINT)}
		/>
	);
};

export default HeaderRight;
