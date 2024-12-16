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
	},
})

export const {
	setResources,
	addResource,
	removeResource,
	replaceResource,
	updateResource,
} = resourceSlice.actions
export default resourceSlice.reducer
