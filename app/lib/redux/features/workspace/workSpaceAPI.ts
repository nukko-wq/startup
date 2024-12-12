import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Workspace } from '@/app/lib/redux/features/workspace/types/workspace'

export const fetchWorkspaces = createAsyncThunk(
	'workspace/fetchWorkspaces',
	async () => {
		const response = await fetch('/api/workspaces')
		if (!response.ok) {
			throw new Error('Failed to fetch workspaces')
		}
		const data: Workspace[] = await response.json()
		return data
	},
)

export const createWorkspace = createAsyncThunk(
	'workspace/createWorkspace',
	async (name: string) => {
		const response = await fetch('/api/workspaces', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		})

		if (!response.ok) {
			throw new Error('Failed to create workspace')
		}

		const data: Workspace = await response.json()
		return data
	},
)
