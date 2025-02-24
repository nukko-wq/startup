import { Plus, SquarePlus } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Menu,
	MenuItem,
	MenuTrigger,
	Modal,
	ModalOverlay,
	Popover,
} from 'react-aria-components'
import WorkspaceCreateForm from '@/app/features/workspace/components/sidebar/WorkspaceCreateForm'
import SpaceCreateForm from '@/app/features/space/components/sidebar/SpaceCreateForm'

const DefaultWorkspaceRightMenu = ({
	workspaceId,
}: {
	workspaceId?: string
}) => {
	const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false)
	const [isSpaceOpen, setIsSpaceOpen] = useState(false)

	const handleNewWorkspace = () => {
		setIsWorkspaceOpen(true)
	}

	const handleNewSpace = () => {
		if (!workspaceId) return
		setIsSpaceOpen(true)
	}

	return (
		<>
			<MenuTrigger>
				<Button className="outline-hidden p-1 mr-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 rounded-full">
					<Plus className="w-5 h-5 text-slate-50" />
				</Button>
				<Popover>
					<Menu className="bg-slate-50 outline-hidden border shadow-md min-w-[200px] rounded-xs">
						<MenuItem
							onAction={handleNewSpace}
							className="p-2 outline-hidden hover:bg-slate-200 cursor-pointer"
						>
							<div className="flex items-center gap-2 text-slate-800">
								<SquarePlus className="w-4 h-4" />
								<span>New Space</span>
							</div>
						</MenuItem>
						<MenuItem
							onAction={handleNewWorkspace}
							className="p-2 outline-hidden hover:bg-slate-200 cursor-pointer"
						>
							<div className="flex items-center gap-2 text-slate-800">
								<SquarePlus className="w-4 h-4" />
								<span>New Workspace</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<DialogTrigger isOpen={isWorkspaceOpen} onOpenChange={setIsWorkspaceOpen}>
				<Button className="hidden">Open Dialog</Button>
				<ModalOverlay className="fixed inset-0 bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur-sm">
					<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
						<Dialog className="outline-hidden">
							<div>
								<h2 className="text-lg font-semibold mb-4">
									新しいワークスペースを作成
								</h2>
								<WorkspaceCreateForm
									onClose={() => setIsWorkspaceOpen(false)}
								/>
							</div>
						</Dialog>
					</Modal>
				</ModalOverlay>
			</DialogTrigger>

			{workspaceId && (
				<DialogTrigger isOpen={isSpaceOpen} onOpenChange={setIsSpaceOpen}>
					<Button className="hidden">Open Dialog</Button>
					<ModalOverlay className="fixed inset-0 bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur-sm">
						<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
							<Dialog className="outline-hidden">
								<div>
									<h2 className="text-lg font-semibold mb-4">
										新しいスペースを作成
									</h2>
									<SpaceCreateForm
										workspaceId={workspaceId}
										onClose={() => setIsSpaceOpen(false)}
									/>
								</div>
							</Dialog>
						</Modal>
					</ModalOverlay>
				</DialogTrigger>
			)}
		</>
	)
}

export default DefaultWorkspaceRightMenu
