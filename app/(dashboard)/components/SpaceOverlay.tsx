'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import { hideSpaceOverlay } from '@/app/lib/redux/features/overlay/overlaySlice'
import {
	selectSpaces,
	selectActiveSpaceId,
} from '@/app/lib/redux/features/space/selector'
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
	const activeSpaceId = useAppSelector(selectActiveSpaceId)
	const activeWorkspaceId = useAppSelector(selectActiveWorkspaceId)
	const defaultWorkspace = useAppSelector(selectDefaultWorkspace)

	// 選択中のインデックスを管理
	const [selectedIndex, setSelectedIndex] = useState(0)
	const listRef = useRef<HTMLDivElement>(null)

	// 初期選択インデックスをアクティブなSpaceに設定
	useEffect(() => {
		if (isVisible && activeSpaceId) {
			const activeIndex = spaces.findIndex(
				(space) => space.id === activeSpaceId,
			)
			if (activeIndex !== -1) {
				setSelectedIndex(activeIndex)
			}
		}
	}, [isVisible, activeSpaceId, spaces])

	// 選択中の要素にフォーカスを当てる
	useEffect(() => {
		if (isVisible && listRef.current) {
			const items = listRef.current.querySelectorAll('[role="option"]')
			if (items[selectedIndex]) {
				;(items[selectedIndex] as HTMLElement).focus()
			}
		}
	}, [isVisible, selectedIndex])

	const handleKeyDown = (event: React.KeyboardEvent) => {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				setSelectedIndex((prev) => (prev + 1) % spaces.length)
				break
			case 'ArrowUp':
				event.preventDefault()
				setSelectedIndex((prev) => (prev - 1 + spaces.length) % spaces.length)
				break
			case 'Enter':
				event.preventDefault()
				handleSpaceClick(spaces[selectedIndex].id)
				break
			case 'Escape':
				// Escapeキーの場合はイベントを伝播させる
				return
			default:
				break
		}
	}

	const handleSpaceClick = async (spaceId: string) => {
		const workspaceId = activeWorkspaceId || defaultWorkspace?.id

		if (!workspaceId) {
			console.error('No workspace found (neither active nor default)')
			return
		}

		try {
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

	const handleRootKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Escape') {
			dispatch(hideSpaceOverlay())
		}
	}

	if (!isVisible) return null

	return (
		<div
			className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50"
			onClick={() => dispatch(hideSpaceOverlay())}
			onKeyDown={handleRootKeyDown}
		>
			<div className="flex flex-col justify-center items-center h-full">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className="flex flex-col bg-gray-100 p-4 rounded-lg w-[800px] h-[800px] overflow-y-auto"
					onClick={(e) => e.stopPropagation()}
				>
					<h2
						className="text-xl font-bold mb-4 text-center"
						id="space-list-title"
					>
						Space一覧
					</h2>
					<div
						ref={listRef}
						// biome-ignore lint/a11y/useSemanticElements: <explanation>
						role="listbox"
						aria-labelledby="space-list-title"
						onKeyDown={handleKeyDown}
						tabIndex={-1}
						className="grid grid-cols-1 gap-4"
					>
						{spaces.map((space, index) => (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<div
								key={space.id}
								// biome-ignore lint/a11y/useSemanticElements: <explanation>
								role="option"
								aria-selected={index === selectedIndex}
								tabIndex={index === selectedIndex ? 0 : -1}
								className={`
									bg-white p-4 rounded-lg shadow cursor-pointer
									${index === selectedIndex ? 'ring-2 ring-blue-500 bg-gray-200' : 'hover:bg-gray-50'}
									focus:outline-hidden focus:ring-2 focus:ring-blue-500
								`}
								onClick={() => handleSpaceClick(space.id)}
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
