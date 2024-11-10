'use client'

import {
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import SpaceRenameForm from './SpaceRenameForm'
import { useSpaceStore } from '@/app/store/spaceStore'

interface SpaceRenameDialogProps {
	spaceId: string
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
}

const SpaceRenameDialog = ({
	spaceId,
	isOpen,
	onOpenChange,
}: SpaceRenameDialogProps) => {
	const spaces = useSpaceStore((state) => state.spaces)
	const currentSpaceName =
		spaces.find((space) => space.id === spaceId)?.name ?? ''

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalOverlay
				isDismissable
				className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur"
			>
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-none">
						<SpaceRenameForm
							spaceId={spaceId}
							initialName={currentSpaceName}
							onClose={() => onOpenChange(false)}
						/>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default SpaceRenameDialog
