import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Space } from '@/app/lib/redux/features/space/types/space'

export const createSpace = createAsyncThunk(
	'space/createSpace',
	async ({ name, workspaceId }: { name: string; workspaceId: string }) => {
		const response = await fetch('/api/spaces', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, workspaceId }),
		})

		if (!response.ok) {
			throw new Error('スペースの作成に失敗しました')
		}

		const data: Space = await response.json()
		return data
	},
)
