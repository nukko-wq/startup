import { configureStore } from '@reduxjs/toolkit'
import workspaceReducer from '@/app/lib/redux/features/workspace/workspaceSlice'
import spaceReducer from '@/app/lib/redux/features/space/spaceSlice'
import sectionReducer from '@/app/lib/redux/features/section/sectionSlice'
export const store = configureStore({
	reducer: {
		workspace: workspaceReducer,
		space: spaceReducer,
		section: sectionReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
