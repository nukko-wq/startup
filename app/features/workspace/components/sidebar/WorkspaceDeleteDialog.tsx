import type { Workspace } from '@/app/lib/redux/features/workspace/types/workspace'
import { deleteWorkspace } from '@/app/lib/redux/features/workspace/workSpaceAPI'
import { removeWorkspace } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { addWorkspace } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'

interface WorkspaceDeleteDialogProps {
	workspace: Workspace
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

const WorkspaceDeleteDialog = ({
	workspace,
	isOpen,
	onOpenChange,
}: WorkspaceDeleteDialogProps) => {
	const dispatch = useAppDispatch()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		try {
			setIsDeleting(true)
			dispatch(removeWorkspace(workspace.id))
			onOpenChange(false)
			await dispatch(deleteWorkspace(workspace.id)).unwrap()
		} catch (error) {
			console.error('Failed to delete workspace:', error)
			dispatch(addWorkspace(workspace))
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className="hidden">Open Dialog</Button>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur-sm">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-hidden relative">
						{({ close }) => (
							<>
								<Heading className="text-xl font-semibold leading-6 my-0 text-slate-700">
									ワークスペースの削除
								</Heading>
								<div className="w-6 h-6 text-red-500 absolute right-0 top-0">
									<AlertTriangle className="w-6 h-6" />
								</div>
								<p className="mt-3 text-slate-500">
									「{workspace.name}
									」を削除してもよろしいですか？この操作は取り消せません。
								</p>
								<div className="mt-6 flex justify-end gap-2">
									<Button
										onPress={close}
										className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 outline-hidden cursor-pointer"
										isDisabled={isDeleting}
									>
										キャンセル
									</Button>
									<Button
										onPress={handleDelete}
										className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 outline-hidden flex items-center gap-2 cursor-pointer"
										isDisabled={isDeleting}
									>
										{isDeleting ? '削除中...' : '削除'}
									</Button>
								</div>
							</>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default WorkspaceDeleteDialog
