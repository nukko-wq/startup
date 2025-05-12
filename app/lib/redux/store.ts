import googleDriveReducer from '@/app/lib/redux/features/google-drive/googleDriveSlice'
import overlayReducer from '@/app/lib/redux/features/overlay/overlaySlice'
import resourceReducer from '@/app/lib/redux/features/resource/resourceSlice'
import sectionReducer from '@/app/lib/redux/features/section/sectionSlice'
import spaceReducer from '@/app/lib/redux/features/space/spaceSlice'
import tabsReducer from '@/app/lib/redux/features/tabs/tabsSlice'
import workspaceReducer from '@/app/lib/redux/features/workspace/workspaceSlice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
	reducer: {
		workspace: workspaceReducer,
		space: spaceReducer,
		section: sectionReducer,
		resource: resourceReducer,
		googleDrive: googleDriveReducer,
		tabs: tabsReducer,
		overlay: overlayReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
