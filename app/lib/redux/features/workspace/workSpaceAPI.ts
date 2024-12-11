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
