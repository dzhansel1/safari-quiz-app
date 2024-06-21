import { Octicons } from '@expo/vector-icons';
import { MODAL_TYPES, useModalsContext } from '@/contexts/modals.context';

const HeaderLeft = () => {
	const { openModal } = useModalsContext();
	const showModal = (modalType: MODAL_TYPES) => {
		openModal(modalType);
	};

	return (
		<Octicons
			size={24}
			color="#FF0800"
			name="x-circle-fill"
			suppressHighlighting={true}
			onPress={() => showModal(MODAL_TYPES.QUIT)}
		/>
	);
};

export default HeaderLeft;
