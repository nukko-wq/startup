import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import { Plus, SquarePlus } from 'lucide-react'
import { useState } from 'react'
import CreateSpaceForm from '@/app/features/spaces/create_space/CreateSpaceForm'
import { useSpaceStore } from '@/app/store/spaceStore'

interface WorkspaceLeftMenuProps {
	workspaceId: string
}

const WorkspaceLeftMenu = ({ workspaceId }: WorkspaceLeftMenuProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const { spaces, setSpaces } = useSpaceStore()

	const handleCreateSpace = async (
		data: { name: string; workspaceId: string },
		close: () => void,
	) => {
		try {
			const response = await fetch('/api/spaces', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					workspaceId: data.workspaceId,
					order: spaces.filter((s) => s.workspaceId === workspaceId).length + 1,
				}),
			})

			if (!response.ok) {
				throw new Error('スペースの作成に失敗しました')
			}

			const newSpace = await response.json()

			// 新しいスペースを追加する前に重複チェック
			const existingSpace = spaces.find((space) => space.id === newSpace.id)
			if (!existingSpace) {
				setSpaces([...spaces, newSpace])
			}

			close()
		} catch (error) {
			console.error('Error creating space:', error)
			throw error
		}
	}

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-1 mr-2 group-hover:bg-gray-700 transition duration-200 rounded-full opacity-0 group-hover:opacity-100"
				>
					<Plus className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-sm shadow-md min-w-[160px]">
						<MenuItem
							className="pl-4 pr-4 py-2 outline-none hover:cursor-pointer"
							onAction={() => setIsOpen(true)}
						>
							<div className="flex items-center gap-3 text-sm">
								<SquarePlus className="w-4 h-4" />
								<span>New Space</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
				<ModalOverlay className="fixed inset-0 bg-black/30 flex items-center justify-center">
					<Modal className="bg-white p-6 rounded-lg">
						<Dialog className="outline-none">
							{({ close }) => (
								<CreateSpaceForm
									workspaceId={workspaceId}
									onClose={close}
									onSubmit={handleCreateSpace}
								/>
							)}
						</Dialog>
					</Modal>
				</ModalOverlay>
			</DialogTrigger>
		</>
	)
}

export default WorkspaceLeftMenu
