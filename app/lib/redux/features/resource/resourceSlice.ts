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
	},
})

export const { setResources, addResource, removeResource } =
	resourceSlice.actions
export default resourceSlice.reducer
