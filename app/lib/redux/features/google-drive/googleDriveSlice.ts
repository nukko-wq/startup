import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { GoogleDriveState, GoogleDriveFile } from './types/googleDrive'

const initialState: GoogleDriveState = {
	files: [],
	loading: false,
	error: null,
}

const googleDriveSlice = createSlice({
	name: 'googleDrive',
	initialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload
		},
		setFiles: (state, action: PayloadAction<GoogleDriveFile[]>) => {
			state.files = action.payload
			state.error = null
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload
			state.files = []
		},
	},
})

export const { setLoading, setFiles, setError } = googleDriveSlice.actions
export default googleDriveSlice.reducer
