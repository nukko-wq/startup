import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'

interface ResourceState {
	resources: Resource[]
}

const initialState: ResourceState = {
	resources: [],
}

export const resourceSlice = createSlice({
	name: 'resource',
	initialState,
	reducers: {
		setResources: (state, action: PayloadAction<Resource[]>) => {
			state.resources = action.payload
		},
		addResource: (state, action: PayloadAction<Resource>) => {
			state.resources.push(action.payload)
		},
		removeResource: (state, action: PayloadAction<string>) => {
			state.resources = state.resources.filter(
				(resource) => resource.id !== action.payload,
			)
		},
		replaceResource: (
			state,
			action: PayloadAction<{ oldId: string; newResource: Resource }>,
		) => {
			const index = state.resources.findIndex(
				(r) => r.id === action.payload.oldId,
			)
			if (index !== -1) {
				state.resources[index] = action.payload.newResource
			}
		},
		updateResource: (state, action: PayloadAction<Resource>) => {
			const index = state.resources.findIndex((r) => r.id === action.payload.id)
			if (index !== -1) {
				state.resources[index] = action.payload
			}
		},
		reorderResources: (
			state,
			action: PayloadAction<{
				sectionId: string
				oldIndex: number
				newIndex: number
			}>,
		) => {
			const { sectionId, oldIndex, newIndex } = action.payload
			const sectionResources = state.resources
				.filter((r) => r.sectionId === sectionId)
				.sort((a, b) => a.order - b.order)

			const [movedResource] = sectionResources.splice(oldIndex, 1)
			sectionResources.splice(newIndex, 0, movedResource)

			// orderを更新
			sectionResources.forEach((resource, index) => {
				const stateIndex = state.resources.findIndex(
					(r) => r.id === resource.id,
				)
				if (stateIndex !== -1) {
					state.resources[stateIndex] = {
						...state.resources[stateIndex],
						order: index,
					}
				}
			})
		},
	},
})

export const {
	setResources,
	addResource,
	removeResource,
	replaceResource,
	updateResource,
	reorderResources,
} = resourceSlice.actions
export default resourceSlice.reducer
