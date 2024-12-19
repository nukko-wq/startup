import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/lib/redux/store'

// 基本的なセレクター
export const selectWorkspaces = (state: RootState) => state.workspace.workspaces
export const selectActiveWorkspaceId = (state: RootState) =>
	state.workspace.activeWorkspaceId

// メモ化されたセレクター
export const selectDefaultWorkspace = createSelector(
	[selectWorkspaces],
	(workspaces) => workspaces.find((w) => w.isDefault),
)

export const selectNonDefaultWorkspaces = createSelector(
	[selectWorkspaces],
	(workspaces) => workspaces.filter((w) => !w.isDefault),
)

export const selectActiveWorkspace = createSelector(
	[selectWorkspaces, selectActiveWorkspaceId],
	(workspaces, activeId) => workspaces.find((w) => w.id === activeId),
)
