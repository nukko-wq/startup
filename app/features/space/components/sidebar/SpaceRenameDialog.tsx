import {
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import SpaceRenameForm from '@/app/features/space/components/sidebar/SpaceRenameForm'

const SpaceRenameDialog = () => {
	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalOverlay
				isDismissable
				className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur"
			>
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-none">
						<h2 className="text-lg font-semibold mb-4">スペース名の変更</h2>
						<SpaceRenameForm />
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default SpaceRenameDialog
