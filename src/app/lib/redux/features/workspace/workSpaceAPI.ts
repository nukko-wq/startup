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

export const deleteWorkspace = createAsyncThunk(
	'workspace/deleteWorkspace',
	async (workspaceId: string) => {
		const response = await fetch(`/api/workspaces/${workspaceId}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			throw new Error('Failed to delete workspace')
		}

		const workspacesResponse = await fetch('/api/workspaces')
		if (!workspacesResponse.ok) {
			throw new Error('Failed to fetch updated workspaces')
		}

		const updatedWorkspaces: Workspace[] = await workspacesResponse.json()
		return { deletedId: workspaceId, updatedWorkspaces }
	},
)

export const updateWorkspace = createAsyncThunk(
	'workspace/updateWorkspace',
	async ({ id, name }: { id: string; name: string }) => {
		const response = await fetch(`/api/workspaces/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		})

		if (!response.ok) {
			throw new Error('Failed to update workspace')
		}

		const data: Workspace = await response.json()
		return data
	},
)

export const reorderWorkspaces = createAsyncThunk(
	'workspace/reorderWorkspaces',
	async (workspaces: { id: string; order: number }[]) => {
		const response = await fetch('/api/workspaces/reorder', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ workspaces }),
		})

		if (!response.ok) {
			throw new Error('Failed to reorder workspaces')
		}

		const data: Workspace[] = await response.json()
		return data
	},
)
