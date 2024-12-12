import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
	WorkspaceState,
	Workspace,
} from '@/app/lib/redux/features/workspace/types/workspace'
import { fetchWorkspaces } from '@/app/lib/redux/features/workspace/workSpaceAPI'
import { createWorkspace } from '@/app/lib/redux/features/workspace/workSpaceAPI'

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
			.addCase(createWorkspace.pending, (state) => {
				state.loading = true
			})
			.addCase(createWorkspace.fulfilled, (state, action) => {
				state.loading = false
				state.workspaces.push(action.payload)
			})
			.addCase(createWorkspace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || null
			})
	},
})

export const { setWorkspaces, setActiveWorkspace, addWorkspace } =
	workspaceSlice.actions
export default workspaceSlice.reducer
