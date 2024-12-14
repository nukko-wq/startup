import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
	SpaceState,
	Space,
} from '@/app/lib/redux/features/space/types/space'
import {
	createSpace,
	deleteSpace,
} from '@/app/lib/redux/features/space/spaceAPI'

const initialState: SpaceState = {
	spaces: [],
	activeSpaceId: null,
	loading: false,
	error: null,
	optimisticSpaces: [],
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
			const targetSpace = state.spaces.find(
				(space) => space.id === action.payload,
			)
			if (targetSpace) {
				state.spaces = state.spaces
					.map((space) => {
						if (
							space.workspaceId === targetSpace.workspaceId &&
							space.order > targetSpace.order
						) {
							return { ...space, order: space.order - 1 }
						}
						return space
					})
					.filter((space) => space.id !== action.payload)
			}
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
		addOptimisticSpace: (state, action: PayloadAction<Space>) => {
			state.optimisticSpaces.push(action.payload)
			state.spaces.push(action.payload)
		},
		removeOptimisticSpace: (state, action: PayloadAction<string>) => {
			state.optimisticSpaces = state.optimisticSpaces.filter(
				(space) => space.id !== action.payload,
			)
			state.spaces = state.spaces.filter((space) => space.id !== action.payload)
		},
		addOptimisticDelete: (state, action: PayloadAction<string>) => {
			state.optimisticSpaces = state.optimisticSpaces.filter(
				(space) => space.id !== action.payload,
			)
			state.spaces = state.spaces.filter((space) => space.id !== action.payload)
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createSpace.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(createSpace.fulfilled, (state, action) => {
				state.loading = false
				state.spaces = state.spaces.map((space) =>
					space.id === state.optimisticSpaces[0]?.id ? action.payload : space,
				)
				state.optimisticSpaces = []
			})
			.addCase(createSpace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'エラーが発生しました'
				if (state.optimisticSpaces.length > 0) {
					state.spaces = state.spaces.filter(
						(space) => space.id !== state.optimisticSpaces[0]?.id,
					)
					state.optimisticSpaces = []
				}
			})
			.addCase(deleteSpace.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(deleteSpace.fulfilled, (state, action) => {
				state.loading = false
			})
			.addCase(deleteSpace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'エラーが発生しました'
				// 削除が失敗した場合、スペースを元に戻す処理を追加する必要があります
			})
	},
})

export const {
	setSpaces,
	setActiveSpace,
	addSpace,
	removeSpace,
	updateSpaceName,
	addOptimisticSpace,
	removeOptimisticSpace,
	addOptimisticDelete,
} = spaceSlice.actions

export default spaceSlice.reducer
