import {
	Button,
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import WorkspaceRenameForm from '@/app/features/workspace/components/sidebar/WorkspaceRenameForm'
import type { Workspace } from '@/app/lib/redux/features/workspace/types/workspace'

interface WorkspaceRenameDialogProps {
	workspace: Workspace
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

const WorkspaceRenameDialog = ({
	workspace,
	isOpen,
	onOpenChange,
}: WorkspaceRenameDialogProps) => {
	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className="hidden">Open Dialog</Button>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur-sm">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-hidden relative">
						{({ close }) => (
							<WorkspaceRenameForm workspace={workspace} onClose={close} />
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default WorkspaceRenameDialog
