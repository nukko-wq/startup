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
import { useResourceStore } from '@/app/store/resourceStore'
import { useRouter } from 'next/navigation'

interface WorkspaceLeftMenuProps {
	workspaceId: string
}

const WorkspaceLeftMenu = ({ workspaceId }: WorkspaceLeftMenuProps) => {
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)
	const spaces = useSpaceStore((state) => state.spaces)
	const setSpaces = useSpaceStore((state) => state.setSpaces)

	const handleCreateSpace = async (
		data: { name: string; workspaceId: string },
		close: () => void,
		onSuccess?: (spaceId: string) => void,
	) => {
		try {
			if (!data.workspaceId) {
				throw new Error('workspaceId is required')
			}

			close()

			const response = await fetch('/api/spaces', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					workspaceId: data.workspaceId,
					withDefaultSection: true,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				console.error('Server response:', errorData)
				throw new Error('スペースの作成に失敗しました')
			}

			const { space, section } = await response.json()

			const spaceStore = useSpaceStore.getState()
			spaceStore.setSpaces([...spaceStore.spaces, space])

			const resourceStore = useResourceStore.getState()
			resourceStore.setSections([...resourceStore.sections, section])

			resourceStore.resourceCache.set(space.id, {
				sections: [section],
				resources: [],
				timestamp: Date.now(),
			})

			await spaceStore.handleSpaceClick(space.id, router)

			if (onSuccess) {
				onSuccess(space.id)
			}
		} catch (error) {
			console.error('Error creating space:', error)
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
							aria-label="New Space"
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
