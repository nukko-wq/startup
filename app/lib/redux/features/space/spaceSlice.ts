import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
	SpaceState,
	Space,
} from '@/app/lib/redux/features/space/types/space'

const initialState: SpaceState = {
	spaces: [],
	activeSpaceId: null,
	loading: false,
	error: null,
}

export const spaceSlice = createSlice({
	name: 'space',
	initialState,
	reducers: {
		setSpaces: (state, action: PayloadAction<Space[]>) => {
			state.spaces = action.payload
		},
		setActiveSpace: (state, action: PayloadAction<string>) => {
			state.activeSpaceId = action.payload
		},
		addSpace: (state, action: PayloadAction<Space>) => {
			state.spaces.push(action.payload)
		},
		removeSpace: (state, action: PayloadAction<string>) => {
			state.spaces = state.spaces.filter((space) => space.id !== action.payload)
		},
		updateSpaceName: (
			state,
			action: PayloadAction<{ id: string; name: string }>,
		) => {
			const space = state.spaces.find((s) => s.id === action.payload.id)
			if (space) {
				space.name = action.payload.name
			}
		},
	},
})

export const {
	setSpaces,
	setActiveSpace,
	addSpace,
	removeSpace,
	updateSpaceName,
} = spaceSlice.actions

export default spaceSlice.reducer
