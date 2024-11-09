'use client'

import { Plus, SquarePlus } from 'lucide-react'
import { Button } from 'react-aria-components'
import { useState } from 'react'
import {
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import CreateSpaceForm from '@/app/features/spaces/create_space/CreateSpaceForm'
import type { Space } from '@/app/types/space'
import { useSpaceStore } from '@/app/store/spaceStore'

interface CreateSpaceInWorkspaceProps {
	workspaceId: string
	onSpaceCreated: (space: Space) => void
}

export default function CreateSpaceInWorkspace({
	workspaceId,
	onSpaceCreated,
}: CreateSpaceInWorkspaceProps) {
	const [isOpen, setIsOpen] = useState(false)

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
				}),
			})

			if (!response.ok) {
				throw new Error('スペースの作成に失敗しました')
			}

			const newSpace = await response.json()

			// 新しいスペースを追加する前に重複チェック
			const existingSpaces = useSpaceStore.getState().spaces
			const isDuplicate = existingSpaces.some(
				(space) => space.id === newSpace.id,
			)

			if (!isDuplicate) {
				onSpaceCreated(newSpace)
			}

			close()
		} catch (error) {
			console.error('Error creating space:', error)
			throw error
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			<Button className="w-full text-left px-5 py-4 text-sm text-gray-400 hover:bg-gray-700 flex items-center gap-1 border border-gray-700">
				<Plus className="w-4 h-4" />
				Add Space to Workspace
			</Button>

			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-none">
						{({ close }) => (
							<div>
								<h2 className="text-lg font-semibold mb-4">
									新しいスペースを作成
								</h2>
								<CreateSpaceForm
									workspaceId={workspaceId}
									onClose={close}
									onSubmit={(data) => handleCreateSpace(data, close)}
								/>
							</div>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}
