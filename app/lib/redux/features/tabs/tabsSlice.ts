import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'
import type { TabsState } from '@/app/lib/redux/features/tabs/types/tabs'
// /app/lib/redux/features/tabs/tabsSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState: TabsState = {
	tabs: [],
	status: 'idle',
	error: null,
}

export const fetchTabs = createAsyncThunk(
	'tabs/fetchTabs',
	async (_, { rejectWithValue }) => {
		try {
			const response = await tabsAPI.getTabs()
			return response
		} catch (error) {
			console.error('Failed to fetch tabs:', error)
			return rejectWithValue(
				error instanceof Error ? error.message : 'Unknown error',
			)
		}
	},
)

const tabsSlice = createSlice({
	name: 'tabs',
	initialState,
	reducers: {
		updateTabs: (state, action) => {
			state.tabs = action.payload
			state.status = 'succeeded'
			state.error = null
		},
		clearError: (state) => {
			state.error = null
		},
		setLoading: (state) => {
			state.status = 'loading'
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchTabs.pending, (state) => {
				state.status = 'loading'
				state.error = null
			})
			.addCase(fetchTabs.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.tabs = action.payload
				state.error = null
			})
			.addCase(fetchTabs.rejected, (state, action) => {
				state.status = 'failed'
				state.error = (action.payload as string) || 'Failed to fetch tabs'
			})
	},
})

export const { updateTabs, clearError, setLoading } = tabsSlice.actions
export default tabsSlice.reducer
