import {
	Button,
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import SpaceRenameForm from './SpaceRenameForm'
import { useAppSelector } from '@/app/lib/redux/hooks'

interface SpaceRenameDialogProps {
	spaceId: string
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

const SpaceRenameDialog = ({
	spaceId,
	isOpen,
	onOpenChange,
}: SpaceRenameDialogProps) => {
	const space = useAppSelector((state) =>
		state.space.spaces.find((s) => s.id === spaceId),
	)

	if (!space) return null

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className="hidden">Open Dialog</Button>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur-sm">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-hidden relative">
						{({ close }) => (
							<div>
								<h2 className="text-lg font-semibold mb-4">スペース名の変更</h2>
								<SpaceRenameForm
									spaceId={spaceId}
									initialName={space.name}
									onClose={close}
								/>
							</div>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default SpaceRenameDialog
