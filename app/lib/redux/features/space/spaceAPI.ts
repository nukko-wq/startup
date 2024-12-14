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

export const deleteSpace = createAsyncThunk(
	'space/deleteSpace',
	async (spaceId: string) => {
		const response = await fetch(`/api/spaces/${spaceId}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			throw new Error('スペースの削除に失敗しました')
		}

		return spaceId
	},
)

export const updateSpace = createAsyncThunk(
	'space/updateSpace',
	async ({ id, name }: { id: string; name: string }) => {
		const response = await fetch(`/api/spaces/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		})

		if (!response.ok) {
			throw new Error('スペースの更新に失敗しました')
		}

		const data: Space = await response.json()
		return data
	},
)
