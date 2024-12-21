'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import { hideSpaceOverlay } from '@/app/lib/redux/features/overlay/overlaySlice'
import { selectSpaces } from '@/app/lib/redux/features/space/selector'
import {
	selectActiveWorkspaceId,
	selectDefaultWorkspace,
} from '@/app/lib/redux/features/workspace/selector'
import { updateSpaceLastActive } from '@/app/lib/redux/features/space/spaceAPI'
import { setActiveSpace } from '@/app/lib/redux/features/space/spaceSlice'

const SpaceOverlay = () => {
	const router = useRouter()
	const dispatch = useAppDispatch()
	const isVisible = useAppSelector(
		(state) => state.overlay.isSpaceOverlayVisible,
	)
	const spaces = useAppSelector(selectSpaces)
	const activeWorkspaceId = useAppSelector(selectActiveWorkspaceId)
	const defaultWorkspace = useAppSelector(selectDefaultWorkspace)

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isVisible) {
				dispatch(hideSpaceOverlay())
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [dispatch, isVisible])

	const handleSpaceClick = async (spaceId: string) => {
		const workspaceId = activeWorkspaceId || defaultWorkspace?.id

		if (!workspaceId) {
			console.error('No workspace found (neither active nor default)')
			return
		}

		try {
			console.log('Updating active space:', {
				spaceId,
				workspaceId,
			})

			dispatch(setActiveSpace(spaceId))

			await dispatch(
				updateSpaceLastActive({
					spaceId,
					workspaceId,
				}),
			).unwrap()

			router.push(`/space/${spaceId}`, {
				scroll: false,
			})

			dispatch(hideSpaceOverlay())
		} catch (error) {
			console.error('Failed to update active space:', error)
		}
	}

	if (!isVisible) return null

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50"
			onClick={() => dispatch(hideSpaceOverlay())}
		>
			<div className="flex flex-col justify-center items-center h-full">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className="flex flex-col bg-gray-100 p-4 rounded-lg w-[800px] h-[800px] overflow-y-auto"
					onClick={(e) => e.stopPropagation()}
				>
					<h2 className="text-xl font-bold mb-4 text-center">Space一覧</h2>
					<div className="grid grid-cols-1 gap-4">
						{spaces.map((space) => (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<div
								key={space.id}
								className="bg-white p-4 rounded-lg shadow hover:bg-gray-50 cursor-pointer"
								onClick={() => {
									console.log('Space clicked:', space.id)
									handleSpaceClick(space.id)
								}}
							>
								<div className="font-medium text-gray-800">{space.name}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default SpaceOverlay
