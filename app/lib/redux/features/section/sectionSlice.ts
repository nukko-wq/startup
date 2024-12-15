// app/lib/redux/features/section/sectionSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Section } from '@/app/lib/redux/features/section/types/section'

interface SectionState {
	sections: Section[]
	activeSectionId: string | null
}

const initialState: SectionState = {
	sections: [],
	activeSectionId: null,
}

const sectionSlice = createSlice({
	name: 'section',
	initialState,
	reducers: {
		setSections: (state, action: PayloadAction<Section[]>) => {
			state.sections = action.payload
		},
		setActiveSectionId: (state, action: PayloadAction<string>) => {
			state.activeSectionId = action.payload
		},
		addSection: (state, action: PayloadAction<Section>) => {
			state.sections.push(action.payload)
		},
		updateSection: (state, action: PayloadAction<Section>) => {
			const index = state.sections.findIndex(
				(section) => section.id === action.payload.id,
			)
			if (index !== -1) {
				state.sections[index] = action.payload
			}
		},
		deleteSection: (state, action: PayloadAction<string>) => {
			state.sections = state.sections.filter(
				(section) => section.id !== action.payload,
			)
		},
	},
})

export const {
	setSections,
	setActiveSectionId,
	addSection,
	updateSection,
	deleteSection,
} = sectionSlice.actions
export default sectionSlice.reducer
