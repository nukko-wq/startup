'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useCallback, useRef } from 'react'
import SidebarMenu from '@/app/components/layouts/sidebar/SidebarMenu'
import SpaceButtonMenu from '@/app/components/layouts/sidebar/SpaceButtonMenu'
import type { Space } from '@/app/types/space'
import { Button } from 'react-aria-components'
import {
	GridList,
	GridListItem,
	useDragAndDrop,
	DropIndicator,
} from 'react-aria-components'
import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import { GripVertical, Layers3 } from 'lucide-react'
import SpacesMenu from '@/app/components/layouts/sidebar/SpacesMenu'

export default function Sidebar() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const {
		spaces,
		setSpaces,
		reorderSpaces,
		activeSpaceId,
		setActiveSpaceId,
		setIsNavigating,
	} = useSpaces()

	const lastUpdateSource = useRef<string | null>(null)

	const handleSpaceSelect = useCallback(async (spaceId: string) => {
		try {
			await fetch('/api/users/last-active-space', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spaceId }),
			})
		} catch (error) {
			console.error('Error updating last active space:', error)
		}
	}, [])

	const handleSpaceClick = useCallback(
		async (spaceId: string) => {
			try {
				setIsNavigating(true)
				lastUpdateSource.current = 'click'

				// 状態更新を同期的に行う
				setActiveSpaceId(spaceId)

				// 少し待ってからナビゲーションを実行
				await new Promise((resolve) => setTimeout(resolve, 50))

				await Promise.all([
					router.push(`/?spaceId=${spaceId}`, { scroll: false }),
					handleSpaceSelect(spaceId),
				])
			} catch (error) {
				console.error('Error switching space:', error)
				setActiveSpaceId(activeSpaceId)
			} finally {
				setTimeout(() => {
					setIsNavigating(false)
				}, 500) // タイマーを500msに延長
			}
		},
		[
			router,
			handleSpaceSelect,
			setActiveSpaceId,
			setIsNavigating,
			activeSpaceId,
		],
	)

	const handleSpaceCreated = async (newSpace: Space) => {
		try {
			setIsNavigating(true)
			setSpaces((prevSpaces) => [...prevSpaces, newSpace])
			setActiveSpaceId(newSpace.id)

			await new Promise((resolve) => setTimeout(resolve, 50))
			await router.push(`/?spaceId=${newSpace.id}`, { scroll: false })
			await handleSpaceSelect(newSpace.id)
		} catch (error) {
			console.error('Error handling new space:', error)
		} finally {
			setTimeout(() => {
				setIsNavigating(false)
			}, 500)
		}
	}

	useEffect(() => {
		if (spaces.length > 0 && !activeSpaceId) {
			const defaultSpace = spaces[0]
			handleSpaceClick(defaultSpace.id)
		}
	}, [spaces, activeSpaceId, handleSpaceClick])

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const space = spaces.find((s) => s.id === Array.from(keys)[0])
			return [
				{
					'space-item': JSON.stringify(space),
					'text/plain': space?.name || '',
				},
			]
		},
		acceptedDragTypes: ['space-item'],
		getDropOperation: () => 'move',
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`sidebar-drop-indicator ${isDropTarget ? 'active' : ''}`
					}
				/>
			)
		},

		onReorder: async (e) => {
			try {
				const items = [...spaces]
				const draggedIndex = items.findIndex(
					(item) => item.id === Array.from(e.keys)[0],
				)
				const targetIndex = items.findIndex((item) => item.id === e.target.key)
				const draggedItem = items[draggedIndex]

				const newIndex =
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1

				items.splice(draggedIndex, 1)
				items.splice(
					newIndex > draggedIndex ? newIndex - 1 : newIndex,
					0,
					draggedItem,
				)

				await reorderSpaces(items)
			} catch (error) {
				console.error('Failed to reorder spaces:', error)
				alert('スペースの並び順の更新に失敗しました')
			}
		},
	})

	// activeSpaceIdの変更を監視
	useEffect(() => {
		console.log('activeSpaceId updated:', activeSpaceId)
		console.log('selectedKeys value:', activeSpaceId ? [activeSpaceId] : [])
	}, [activeSpaceId])

	// デバッグ用のuseEffect
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		console.log('Component rendered with activeSpaceId:', activeSpaceId)
	}, [])

	return (
		<div className="hidden md:flex w-[320px] bg-gray-800">
			<div className="flex-grow text-zinc-50">
				<div className="flex items-center justify-between p-4">
					<div className="text-2xl font-bold text-zinc-50">StartUp</div>
					<SidebarMenu />
				</div>
				<div className="flex justify-between items-center pl-3 pr-2">
					<div className="flex items-center gap-2">
						<Layers3 className="w-5 h-5 text-gray-400" />
						<div className="text-gray-400 font-semibold text-lg">Spaces</div>
					</div>
					<SpacesMenu onSpaceCreated={handleSpaceCreated} />
				</div>
				<GridList
					aria-label="Spaces"
					items={spaces}
					dragAndDropHooks={dragAndDropHooks}
					selectionMode="single"
					selectedKeys={activeSpaceId ? new Set([activeSpaceId]) : new Set()}
					disallowEmptySelection
					onSelectionChange={(keys) => {
						const selectedKey = Array.from(keys)[0] as string
						if (selectedKey) {
							handleSpaceClick(selectedKey)
						}
					}}
					className="flex flex-col pt-2"
				>
					{(space) => (
						<GridListItem
							key={space.id}
							textValue={space.name}
							className={({ isSelected, isFocusVisible }) => `
								flex items-center justify-between outline-none cursor-pointer hover:bg-gray-700 hover:bg-opacity-75 group py-1
								${isSelected ? 'bg-gray-700' : ''}
								${isFocusVisible ? 'ring-2 ring-blue-500' : ''}
							`}
						>
							<div className="flex items-center w-full group">
								<div
									className="cursor-grab flex items-center opacity-0 group-hover:opacity-100"
									aria-label="Drag Wrapper"
								>
									<Button
										slot="drag"
										aria-label="ドラッグハンドル"
										className="cursor-grab p-2"
									>
										<GripVertical className="w-4 h-4 text-zinc-500" />
									</Button>
								</div>
								<Button
									className="px-2 py-2 rounded cursor-pointer block w-full text-left text-zinc-50 outline-none"
									onPress={() => handleSpaceClick(space.id)}
								>
									{space.name}
								</Button>
							</div>
							<SpaceButtonMenu
								spaceId={space.id}
								spaceName={space.name}
								setSpaces={setSpaces}
							/>
						</GridListItem>
					)}
				</GridList>
			</div>
		</div>
	)
}
