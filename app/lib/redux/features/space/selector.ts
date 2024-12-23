import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/lib/redux/store'

export const selectSpaces = (state: RootState) => state.space.spaces
export const selectActiveSpaceId = (state: RootState) =>
	state.space.activeSpaceId

export const selectSpacesByWorkspaceId = createSelector(
	[selectSpaces, (_state: RootState, workspaceId: string) => workspaceId],
	(spaces, workspaceId) => {
		return [...spaces]
			.filter((space) => space.workspaceId === workspaceId)
			.sort((a, b) => a.order - b.order)
	},
)

export const selectActiveSpace = createSelector(
	[selectSpaces, selectActiveSpaceId],
	(spaces, activeSpaceId) =>
		activeSpaceId ? spaces.find((space) => space.id === activeSpaceId) : null,
)

export const selectSortedSpacesByWorkspaceId = createSelector(
	[selectSpacesByWorkspaceId],
	(spaces) => {
		return [...spaces].sort((a, b) => a.order - b.order)
	},
)
