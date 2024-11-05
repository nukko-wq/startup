'use client'

import { EllipsisVertical, SquarePlus } from 'lucide-react'
import { useState } from 'react'
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
import CreateSpaceForm from '@/app/features/spaces/create_space/CreateSpaceForm'
import type { Space } from '@/app/types/space'

interface SpacesMenuProps {
	onSpaceCreated: (space: Space) => void
}

const SpacesMenu = ({ onSpaceCreated }: SpacesMenuProps) => {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

	const handleCreateSpace = async (data: { name: string }) => {
		try {
			const response = await fetch('/api/spaces', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					workspaceId: 'default',
				}),
			})

			if (!response.ok) {
				throw new Error('スペースの作成に失敗しました')
			}

			const space = await response.json()
			onSpaceCreated(space)
			setIsCreateDialogOpen(false)
		} catch (error) {
			console.error('Error creating space:', error)
		}
	}

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-2 hover:bg-gray-700 transition-colors duration-200 rounded-full"
				>
					<EllipsisVertical className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border shadow-md min-w-[200px] rounded-sm">
						<MenuItem
							onAction={() => setIsCreateDialogOpen(true)}
							className="p-2 outline-none hover:bg-zinc-200 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<SquarePlus className="w-4 h-4" />
								New Space
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<DialogTrigger
				isOpen={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
			>
				<Button className="hidden">Open Dialog</Button>
				<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
					<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
						<Dialog className="outline-none">
							{({ close }) => (
								<div>
									<h2 className="text-lg font-semibold mb-4">
										新しいスペースを作成
									</h2>
									<CreateSpaceForm
										onClose={close}
										onSubmit={handleCreateSpace}
									/>
								</div>
							)}
						</Dialog>
					</Modal>
				</ModalOverlay>
			</DialogTrigger>
		</>
	)
}

export default SpacesMenu
