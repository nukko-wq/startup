import { configureStore } from '@reduxjs/toolkit'
import workspaceReducer from '@/app/lib/redux/features/workspace/workspaceSlice'
import spaceReducer from '@/app/lib/redux/features/space/spaceSlice'
import sectionReducer from '@/app/lib/redux/features/section/sectionSlice'
import resourceReducer from '@/app/lib/redux/features/resource/resourceSlice'
import googleDriveReducer from '@/app/lib/redux/features/google-drive/googleDriveSlice'
import tabsReducer from '@/app/lib/redux/features/tabs/tabsSlice'

export const store = configureStore({
	reducer: {
		workspace: workspaceReducer,
		space: spaceReducer,
		section: sectionReducer,
		resource: resourceReducer,
		googleDrive: googleDriveReducer,
		tabs: tabsReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
