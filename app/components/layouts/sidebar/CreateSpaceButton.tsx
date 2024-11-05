'use client'

import { Button } from 'react-aria-components'
import { Plus } from 'lucide-react'
import type { Space } from '@/app/types/space'

interface CreateSpaceButtonProps {
	onSpaceCreated: (space: Space) => void
}

export default function CreateSpaceButton({
	onSpaceCreated,
}: CreateSpaceButtonProps) {
	const handleCreateSpace = async () => {
		try {
			const response = await fetch('/api/spaces', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'New Space',
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to create space')
			}

			const newSpace = await response.json()
			onSpaceCreated(newSpace)
		} catch (error) {
			console.error('Error creating space:', error)
			alert('スペースの作成に失敗しました')
		}
	}

	return (
		<Button
			onPress={handleCreateSpace}
			className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-700 w-full outline-none group"
		>
			<Plus className="w-6 h-6 p-1 text-zinc-50 bg-gray-700 rounded-full group-hover:bg-gray-600" />
			<span className="text-zinc-50">New Space</span>
		</Button>
	)
}
