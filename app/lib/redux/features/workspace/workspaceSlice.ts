import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
	WorkspaceState,
	Workspace,
} from '@/app/lib/redux/features/workspace/types/workspace'
import {
	fetchWorkspaces,
	createWorkspace,
	deleteWorkspace,
	updateWorkspace,
	reorderWorkspaces,
} from '@/app/lib/redux/features/workspace/workSpaceAPI'
import type { AsyncThunk } from '@reduxjs/toolkit'

const initialState: WorkspaceState = {
	workspaces: [],
	activeWorkspaceId: null,
	loading: false,
	error: null,
}

export const workspaceSlice = createSlice({
	name: 'workspace',
	initialState,
	reducers: {
		setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
			state.workspaces = action.payload
		},
		setActiveWorkspace: (state, action: PayloadAction<string>) => {
			state.activeWorkspaceId = action.payload
		},
		addWorkspace: (state, action: PayloadAction<Workspace>) => {
			state.workspaces.push(action.payload)
		},
		removeWorkspace: (state, action: PayloadAction<string>) => {
			state.workspaces = state.workspaces.filter((w) => w.id !== action.payload)
		},
		replaceWorkspace: (
			state,
			action: PayloadAction<{ tempId: string; workspace: Workspace }>,
		) => {
			const index = state.workspaces.findIndex(
				(w) => w.id === action.payload.tempId,
			)
			if (index !== -1) {
				state.workspaces[index] = action.payload.workspace
			}
		},
		updateWorkspaceName: (
			state,
			action: PayloadAction<{ id: string; name: string }>,
		) => {
			const workspace = state.workspaces.find((w) => w.id === action.payload.id)
			if (workspace) {
				workspace.name = action.payload.name
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchWorkspaces.pending, (state) => {
				state.loading = true
			})
			.addCase(fetchWorkspaces.fulfilled, (state, action) => {
				state.loading = false
				state.workspaces = action.payload
			})
			.addCase(fetchWorkspaces.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || null
			})
			.addCase(createWorkspace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || null
			})
			.addCase(deleteWorkspace.fulfilled, (state, action) => {
				state.workspaces = action.payload.updatedWorkspaces
				state.loading = false
			})
			.addCase(deleteWorkspace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || null
			})
			.addCase(updateWorkspace.fulfilled, (state, action) => {
				const index = state.workspaces.findIndex(
					(w) => w.id === action.payload.id,
				)
				if (index !== -1) {
					state.workspaces[index] = action.payload
				}
				state.loading = false
			})
			.addCase(updateWorkspace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || null
			})
			.addCase(reorderWorkspaces.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(reorderWorkspaces.fulfilled, (state, action) => {
				state.workspaces = action.payload
				state.loading = false
			})
			.addCase(reorderWorkspaces.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || null
			})
	},
})

export const {
	setWorkspaces,
	setActiveWorkspace,
	addWorkspace,
	removeWorkspace,
	replaceWorkspace,
	updateWorkspaceName,
} = workspaceSlice.actions
export default workspaceSlice.reducer
