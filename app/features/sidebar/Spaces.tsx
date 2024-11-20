'use client'

import { useSpaceStore } from '@/app/store/spaceStore'
import type { Space } from '@/app/types/space'
import { GripVertical } from 'lucide-react'
import {
	Button,
	GridList,
	GridListItem,
	useDragAndDrop,
	DropIndicator,
	isTextDropItem,
} from 'react-aria-components'
import SpaceButtonMenu from './SpaceButtonMenu'
import { useRouter } from 'next/navigation'
import { useMemo, useCallback, memo } from 'react'
import CreateSpaceInWorkspace from '../workspaces/create_space/CreateSpaceInWorkspace'
import { useResourceStore } from '@/app/store/resourceStore'
import debounce from 'lodash/debounce'

interface SpacesProps {
	workspaceId: string
}

const Spaces = memo(function Spaces({ workspaceId }: SpacesProps) {
	const router = useRouter()
	const spaces = useSpaceStore((state) => state.spaces)
	const activeSpaceId = useSpaceStore((state) => state.activeSpaceId)
	const isNavigating = useSpaceStore((state) => state.isNavigating)
	const isDragging = useSpaceStore((state) => state.isDragging)
	const setSpaces = useSpaceStore((state) => state.setSpaces)
	const handleSpaceClick = useSpaceStore((state) => state.handleSpaceClick)
	const reorderSpaces = useSpaceStore((state) => state.reorderSpaces)
	const setIsDragging = useSpaceStore((state) => state.setIsDragging)
	const fetchSections = useResourceStore((state) => state.fetchSections)
	const prefetchedSections = useResourceStore(
		(state) => state.prefetchedSections,
	)

	const workspaceSpaces = useMemo(
		() => spaces.filter((space) => space.workspaceId === workspaceId),
		[spaces, workspaceId],
	)

	// スペースにホバーした時のデータ事前取得を最適化
	const handleSpaceHover = useCallback(
		debounce(async (spaceId: string) => {
			if (
				spaceId !== useSpaceStore.getState().activeSpaceId &&
				!useSpaceStore.getState().isNavigating &&
				!useResourceStore.getState().resourceCache.has(spaceId)
			) {
				useResourceStore.getState().prefetchNextSpace(spaceId)
			}
		}, 200),
		[],
	)

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) => {
			const space = spaces.find((s) => s.id === Array.from(keys)[0])
			return [
				{
					'space-item': JSON.stringify(space),
					'text/plain': space?.name || '',
				},
			]
		},
		onDragStart: () => {
			setIsDragging(true)
		},
		acceptedDragTypes: ['space-item'],
		getDropOperation: () => 'move',
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) => `
						drop-indicator
						${isDropTarget ? 'active' : ''}
					`}
				/>
			)
		},
		onDragEnd: () => {
			setIsDragging(false)
		},
		onReorder: async (e) => {
			const items = [...workspaceSpaces]
			const draggedIndex = items.findIndex(
				(item) => item.id === Array.from(e.keys)[0],
			)
			const targetIndex = items.findIndex((item) => item.id === e.target.key)
			const draggedItem = items[draggedIndex]

			if (draggedIndex !== -1 && targetIndex !== -1) {
				items.splice(draggedIndex, 1)
				items.splice(
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1,
					0,
					draggedItem,
				)

				// 順序を更新
				const updatedItems = items.map((item, index) => ({
					...item,
					order: index,
				}))

				await reorderSpaces(updatedItems)
			}
		},
		async onInsert(e) {
			try {
				const items = await Promise.all(
					e.items
						.filter(isTextDropItem)
						.map(async (item) => JSON.parse(await item.getText('space-item'))),
				)

				const insertedSpace = items[0]
				if (!insertedSpace) return

				// 現在のワークスペース内のスペースを取得
				const currentWorkspaceSpaces = spaces.filter(
					(s) => s.workspaceId === workspaceId,
				)

				// 移動元のワークスペースのスペースを取得
				const sourceWorkspaceSpaces = spaces.filter(
					(s) => s.workspaceId === insertedSpace.workspaceId,
				)

				// ターゲットのスペースとその位置を取得
				const targetSpace = currentWorkspaceSpaces.find(
					(s) => s.id === e.target.key,
				)
				let newOrder: number

				if (currentWorkspaceSpaces.length === 0) {
					newOrder = 1
				} else if (!targetSpace) {
					const maxOrder = Math.max(
						...currentWorkspaceSpaces.map((s) => s.order),
					)
					newOrder = maxOrder + 1
				} else {
					newOrder =
						e.target.dropPosition === 'before'
							? targetSpace.order
							: targetSpace.order + 1
				}

				const updatedSpaces = spaces
					.map((space) => {
						// 移動先のワークスペース内のスペースを更新
						if (space.workspaceId === workspaceId) {
							if (space.order >= newOrder) {
								return { ...space, order: space.order + 1 }
							}
						}
						// 移動元のワークスペース内のスペースを更新
						else if (space.workspaceId === insertedSpace.workspaceId) {
							if (space.order > insertedSpace.order) {
								return { ...space, order: space.order - 1 }
							}
						}
						// 移動するスペース自体を更新
						if (space.id === insertedSpace.id) {
							return { ...space, workspaceId, order: newOrder }
						}
						return space
					})
					.sort((a, b) => a.order - b.order)

				// 状態を即時更新
				setSpaces(updatedSpaces)

				// APIリクエストを実行
				await Promise.all([
					reorderSpaces(updatedSpaces),
					fetch(`/api/spaces/${insertedSpace.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							workspaceId,
							order: newOrder,
						}),
					}),
				])
			} catch (error) {
				console.error('Failed to insert space:', error)
				throw error
			}
		},
		async onRootDrop(e) {
			try {
				const items = await Promise.all(
					e.items
						.filter(isTextDropItem)
						.map(async (item) => JSON.parse(await item.getText('space-item'))),
				)

				const draggedSpace = items[0]
				if (!draggedSpace) return

				// 空のワークスペースの場合は order を 1 に設定
				const newOrder = 1

				const updatedSpaces = spaces
					.map((space) => {
						if (space.workspaceId === draggedSpace.workspaceId) {
							if (space.order > draggedSpace.order) {
								return { ...space, order: space.order - 1 }
							}
						}
						if (space.id === draggedSpace.id) {
							return { ...space, order: newOrder, workspaceId }
						}
						return space
					})
					.sort((a, b) => a.order - b.order)

				setSpaces(updatedSpaces)

				await Promise.all([
					fetch(`/api/spaces/${draggedSpace.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							workspaceId,
							order: newOrder,
						}),
					}),
					reorderSpaces(updatedSpaces),
				])
			} catch (error) {
				console.error('Failed to drop space:', error)
				setSpaces(spaces)
			}
		},
	})

	return (
		<GridList
			aria-label="Spaces in workspace"
			items={workspaceSpaces}
			dragAndDropHooks={dragAndDropHooks}
			className="flex flex-col outline-none"
			selectionMode="single"
			selectedKeys={activeSpaceId ? [activeSpaceId] : []}
			onSelectionChange={(keys) => {
				const selectedKey = Array.from(keys)[0] as string
				if (selectedKey && selectedKey !== activeSpaceId && !isNavigating) {
					handleSpaceClick(selectedKey, router)
				}
			}}
			renderEmptyState={() => (
				<div data-drop-target className="ml-11 mr-4">
					<CreateSpaceInWorkspace
						workspaceId={workspaceId}
						onSpaceCreated={(newSpace) => {
							// 新しいスペースを追加する前に重複チェック
							const existingSpace = spaces.find((s) => s.id === newSpace.id)
							if (!existingSpace) {
								setSpaces([...spaces, newSpace])
							}
						}}
					/>
				</div>
			)}
		>
			{(item) => (
				<GridListItem
					key={item.id}
					id={item.id}
					textValue={item.name}
					className={({ isSelected, isFocusVisible }) => `
						flex flex-grow items-center justify-between text-gray-400 outline-none cursor-pointer hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200
						${isSelected ? 'bg-gray-700 border-l-4 border-blue-500 pl-3 text-zinc-50' : 'pl-4'}
						${isFocusVisible ? '' : ''}
					`}
				>
					<div
						className="flex flex-grow items-center justify-between group py-1"
						onPointerEnter={() => handleSpaceHover(item.id)}
					>
						<div className="flex items-center flex-grow">
							<div className="flex items-center cursor-grab">
								<Button
									slot="drag"
									className="cursor-grab flex items-center pr-3"
									aria-label="ドラッグハンドル"
								>
									<GripVertical className="w-4 h-4 text-zinc-500" />
								</Button>
							</div>
							{/* スペース名 */}
							<Button
								onPress={() => handleSpaceClick(item.id, router)}
								className="flex-grow text-left outline-none text-sm"
							>
								{item.name}
							</Button>
						</div>
						<div className="opacity-0 group-hover:opacity-100">
							<SpaceButtonMenu spaceId={item.id} spaceName={item.name} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
})

export default Spaces
