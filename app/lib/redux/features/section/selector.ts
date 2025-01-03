// app/lib/redux/features/section/selector.ts

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/lib/redux/store'

export const selectSections = (state: RootState) => state.section.sections
export const selectActiveSectionId = (state: RootState) =>
	state.section.activeSectionId
export const selectActiveSpaceId = (state: RootState) =>
	state.space.activeSpaceId

export const selectSectionsByActiveSpace = createSelector(
	[selectSections, selectActiveSpaceId],
	(sections, activeSpaceId) => {
		if (!activeSpaceId) return []
		return sections
			.filter((section) => section.spaceId === activeSpaceId)
			.sort((a, b) => a.order - b.order)
	},
)
