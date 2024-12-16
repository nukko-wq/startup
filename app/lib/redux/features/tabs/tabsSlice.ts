// /app/lib/redux/features/tabs/tabsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { TabsState } from '@/app/lib/redux/features/tabs/types/tabs'
import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'

const initialState: TabsState = {
	tabs: [],
	status: 'idle',
	error: null,
}

export const fetchTabs = createAsyncThunk('tabs/fetchTabs', async () => {
	const response = await tabsAPI.getTabs()
	return response
})

const tabsSlice = createSlice({
	name: 'tabs',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchTabs.pending, (state) => {
				state.status = 'loading'
			})
			.addCase(fetchTabs.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.tabs = action.payload
			})
			.addCase(fetchTabs.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message || null
			})
	},
})

export default tabsSlice.reducer
