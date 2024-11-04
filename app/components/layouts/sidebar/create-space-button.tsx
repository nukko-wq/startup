'use client'

import { Button } from 'react-aria-components'
import { Plus } from 'lucide-react'

export default function CreateSpaceButton() {
	const handleCreateSpace = async () => {
		try {
			const response = await fetch('/api/spaces', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'New Space',
					order: 0, // 適切な順序を設定
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to create space')
			}

			// ページをリフレッシュして新しいスペースを表示
			window.location.reload()
		} catch (error) {
			console.error('Error creating space:', error)
			alert('スペースの作成に失敗しました')
		}
	}

	return (
		<Button
			onPress={handleCreateSpace}
			className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 w-full"
		>
			<Plus className="w-4 h-4" />
			<span>New Space</span>
		</Button>
	)
}
