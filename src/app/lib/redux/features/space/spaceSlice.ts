import {
	createSpace,
	deleteSpace,
	reorderSpaces,
	updateSpace,
	updateSpaceLastActive,
} from '@/app/lib/redux/features/space/spaceAPI'
import type {
	Space,
	SpaceState,
} from '@/app/lib/redux/features/space/types/space'
import { type PayloadAction, createSlice } from '@reduxjs/toolkit'

const initialState: SpaceState = {
	spaces: [],
	activeSpaceId: null,
	status: 'idle',
	loading: false,
	error: null,
	optimisticSpaces: [],
	previousSpaces: null,
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
		updateLastActiveSpace: (state, action: PayloadAction<string>) => {
			// 前回のアクティブスペースを探して更新
			const previousActive = state.spaces.find(space => space.isLastActive)
			if (previousActive && previousActive.id !== action.payload) {
				previousActive.isLastActive = false
			}
			
			// 新しいアクティブスペースを探して更新
			const newActive = state.spaces.find(space => space.id === action.payload)
			if (newActive) {
				newActive.isLastActive = true
			}
		},
		savePreviousSpaces: (state) => {
			state.previousSpaces = [...state.spaces]
		},
		restorePreviousSpaces: (state) => {
			if (state.previousSpaces) {
				state.spaces = state.previousSpaces
				state.previousSpaces = null
			}
		},
		clearError: (state) => {
			state.error = null
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
				
				// 前回のアクティブスペースを探して更新
				const previousActive = state.spaces.find(space => space.isLastActive)
				if (previousActive && previousActive.id !== action.payload.id) {
					previousActive.isLastActive = false
				}
				
				// 新しいアクティブスペースを探して更新
				const newActive = state.spaces.find(space => space.id === action.payload.id)
				if (newActive) {
					newActive.isLastActive = true
				}
				
				state.activeSpaceId = action.payload.id
				state.optimisticSpaces = []
				state.error = null
			})
			.addCase(createSpace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'スペースの作成に失敗しました'
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
				state.error = null
			})
			.addCase(deleteSpace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'スペースの削除に失敗しました'
				if (state.previousSpaces) {
					state.spaces = state.previousSpaces
					state.previousSpaces = null
				}
			})
			.addCase(updateSpaceLastActive.pending, (state) => {
				state.error = null
			})
			.addCase(updateSpaceLastActive.fulfilled, (state, action) => {
				// 前回のアクティブスペースを探して更新
				const previousActive = state.spaces.find(space => space.isLastActive)
				if (previousActive && previousActive.id !== action.payload.id) {
					previousActive.isLastActive = false
				}
				
				// 新しいアクティブスペースを探して更新
				const newActive = state.spaces.find(space => space.id === action.payload.id)
				if (newActive) {
					newActive.isLastActive = true
				}
				
				state.activeSpaceId = action.payload.id
				state.error = null
			})
			.addCase(updateSpaceLastActive.rejected, (state, action) => {
				state.error =
					action.error.message || 'アクティブスペースの更新に失敗しました'
			})
			.addCase(updateSpace.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(updateSpace.fulfilled, (state, action) => {
				state.loading = false
				const index = state.spaces.findIndex(
					(space) => space.id === action.payload.id,
				)
				if (index !== -1) {
					state.spaces[index] = action.payload
				}
				state.error = null
			})
			.addCase(updateSpace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'スペースの更新に失敗しました'
			})
			.addCase(reorderSpaces.pending, (state) => {
				state.previousSpaces = [...state.spaces]
				state.error = null
			})
			.addCase(reorderSpaces.fulfilled, (state, action) => {
				state.spaces = action.payload
				state.previousSpaces = null
				state.error = null
			})
			.addCase(reorderSpaces.rejected, (state, action) => {
				if (state.previousSpaces) {
					state.spaces = state.previousSpaces
					state.previousSpaces = null
				}
				state.error = action.error.message || 'スペースの並び替えに失敗しました'
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
	updateLastActiveSpace,
	savePreviousSpaces,
	restorePreviousSpaces,
	clearError,
} = spaceSlice.actions

export default spaceSlice.reducer
