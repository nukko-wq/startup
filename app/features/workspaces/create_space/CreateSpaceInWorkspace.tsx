'use client'

import { SquarePlus } from 'lucide-react'
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
		data: { name: string },
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
					workspaceId: workspaceId,
				}),
			})

			if (!response.ok) {
				throw new Error('スペースの作成に失敗しました')
			}

			const space = await response.json()
			onSpaceCreated(space)
			close()
		} catch (error) {
			console.error('Error creating space:', error)
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			<Button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
				<SquarePlus className="w-4 h-4" />
				スペースを作成
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
