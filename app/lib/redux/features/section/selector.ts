// app/lib/redux/features/section/selector.ts

import type { RootState } from '@/app/lib/redux/store'
import { createSelector } from '@reduxjs/toolkit'

export const selectSections = (state: RootState) => state.section.sections
export const selectActiveSectionId = (state: RootState) =>
	state.section.activeSectionId
export const selectActiveSpaceId = (state: RootState) =>
	state.space.activeSpaceId

export const selectSectionsByActiveSpace = createSelector(
	[selectSections, selectActiveSpaceId],
	(sections, activeSpaceId) => {
		if (!activeSpaceId) return { sections: [], isLoaded: false }
		const filteredSections = sections.filter(
			(section) => section.spaceId === activeSpaceId,
		)
		return {
			sections: filteredSections.sort((a, b) => a.order - b.order),
			isLoaded: filteredSections.length > 0,
		}
	},
)
