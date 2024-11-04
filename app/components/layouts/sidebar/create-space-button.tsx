'use client'

import { Button } from 'react-aria-components'
import { Plus } from 'lucide-react'
import type { Space } from '@/app/types/space'

interface CreateSpaceButtonProps {
	setSpaces: React.Dispatch<React.SetStateAction<Space[]>>
}

export default function CreateSpaceButton({
	setSpaces,
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
			setSpaces((prevSpaces) => [...prevSpaces, newSpace])
		} catch (error) {
			console.error('Error creating space:', error)
			alert('スペースの作成に失敗しました')
		}
	}

	return (
		<Button
			onPress={handleCreateSpace}
			className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 w-full outline-none"
		>
			<Plus className="w-4 h-4" />
			<span>New Space</span>
		</Button>
	)
}
