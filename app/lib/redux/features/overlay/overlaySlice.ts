import { createSlice } from '@reduxjs/toolkit'

interface OverlayState {
	isSpaceOverlayVisible: boolean
}

const initialState: OverlayState = {
	isSpaceOverlayVisible: false,
}

const overlaySlice = createSlice({
	name: 'overlay',
	initialState,
	reducers: {
		showSpaceOverlay: (state) => {
			state.isSpaceOverlayVisible = true
		},
		hideSpaceOverlay: (state) => {
			state.isSpaceOverlayVisible = false
		},
	},
})

export const { showSpaceOverlay, hideSpaceOverlay } = overlaySlice.actions
export default overlaySlice.reducer
