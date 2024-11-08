'use client'

import { Button } from 'react-aria-components'
import { Plus } from 'lucide-react'
import type { Space } from '@/app/types/space'
import { useState } from 'react'
import {
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import CreateSpaceForm from '@/app/features/spaces/create_space/CreateSpaceForm'

interface CreateSpaceButtonProps {
	onSpaceCreated: (space: Space) => void
	workspaceId: string
}

export default function CreateSpaceButton({
	onSpaceCreated,
	workspaceId,
}: CreateSpaceButtonProps) {
	const [isOpen, setIsOpen] = useState(false)

	const handleCreateSpace = async (data: { name: string }) => {
		try {
			const response = await fetch('/api/spaces', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					workspaceId: workspaceId,
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to create space')
			}

			const newSpace = await response.json()
			onSpaceCreated(newSpace)
			setIsOpen(false)
		} catch (error) {
			console.error('Error creating space:', error)
			alert('スペースの作成に失敗しました')
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			<Button
				onPress={() => setIsOpen(true)}
				className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-700 hover:bg-opacity-75 w-full outline-none group"
			>
				<Plus className="w-6 h-6 p-1 text-zinc-50 bg-gray-700 rounded-full group-hover:bg-gray-600" />
				<span className="text-zinc-50">New Space</span>
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
									onClose={close}
									onSubmit={handleCreateSpace}
									workspaceId={workspaceId}
								/>
							</div>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}
