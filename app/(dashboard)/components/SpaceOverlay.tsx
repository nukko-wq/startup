'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import { hideSpaceOverlay } from '@/app/lib/redux/features/overlay/overlaySlice'

const SpaceOverlay = () => {
	const dispatch = useAppDispatch()
	const isVisible = useAppSelector(
		(state) => state.overlay.isSpaceOverlayVisible,
	)

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isVisible) {
				dispatch(hideSpaceOverlay())
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [dispatch, isVisible])

	if (!isVisible) return null

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className="fixed inset-0 bg-black bg-opacity-50 z-50"
			onClick={() => dispatch(hideSpaceOverlay())}
		>
			<div className="flex flex-col justify-center items-center h-full">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className="flex flex-col justify-center items-center bg-gray-100 p-4 rounded-lg w-[800px] h-[800px]"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="text-gray-800 text-xl mb-4">Space一覧</div>
				</div>
			</div>
		</div>
	)
}

export default SpaceOverlay
