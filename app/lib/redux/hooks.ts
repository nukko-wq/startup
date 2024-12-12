import {
	type TypedUseSelectorHook,
	useDispatch,
	useSelector,
} from 'react-redux'
import type { RootState, AppDispatch } from '@/app/lib/redux/store'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
