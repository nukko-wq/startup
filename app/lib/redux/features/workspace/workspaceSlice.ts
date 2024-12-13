import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
	WorkspaceState,
	Workspace,
} from '@/app/lib/redux/features/workspace/types/workspace'
import {
	fetchWorkspaces,
	createWorkspace,
	deleteWorkspace,
} from '@/app/lib/redux/features/workspace/workSpaceAPI'

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
				state.workspaces = state.workspaces.filter(
					(workspace) => workspace.id !== action.payload,
				)
				state.loading = false
			})
			.addCase(deleteWorkspace.rejected, (state, action) => {
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
} = workspaceSlice.actions
export default workspaceSlice.reducer
