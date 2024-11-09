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
import { useMemo } from 'react'
import CreateSpaceInWorkspace from '../workspaces/create_space/CreateSpaceInWorkspace'

interface SpacesProps {
	workspaceId: string
}

const Spaces = ({ workspaceId }: SpacesProps) => {
	const {
		spaces,
		activeSpaceId,
		isNavigating,
		isDragging,
		setSpaces,
		handleSpaceClick,
		reorderSpaces,
		setIsDragging,
		updateSpaceWorkspace,
	} = useSpaceStore()

	const workspaceSpaces = useMemo(
		() => spaces.filter((space) => space.workspaceId === workspaceId),
		[spaces, workspaceId],
	)

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) =>
			[...keys].map((key) => ({
				'space-item': JSON.stringify(spaces.find((space) => space.id === key)),
			})),
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
		async onReorder(e) {
			try {
				const draggedSpace = spaces.find((s) => s.id === Array.from(e.keys)[0])
				if (!draggedSpace) return

				const targetSpace = workspaceSpaces.find((s) => s.id === e.target.key)
				if (!targetSpace) return

				const newOrder =
					e.target.dropPosition === 'before'
						? targetSpace.order
						: targetSpace.order + 1

				const updatedSpaces = spaces.map((space) => {
					if (space.workspaceId === workspaceId) {
						if (draggedSpace.workspaceId !== workspaceId) {
							if (space.order >= newOrder) {
								return { ...space, order: space.order + 1 }
							}
						} else {
							if (space.id === draggedSpace.id) {
								return { ...space, order: newOrder }
							}
							if (draggedSpace.order < space.order && space.order <= newOrder) {
								return { ...space, order: space.order - 1 }
							}
							if (draggedSpace.order > space.order && space.order >= newOrder) {
								return { ...space, order: space.order + 1 }
							}
						}
					} else if (space.workspaceId === draggedSpace.workspaceId) {
						if (space.order > draggedSpace.order) {
							return { ...space, order: space.order - 1 }
						}
					} else if (space.id === draggedSpace.id) {
						return { ...space, order: newOrder, workspaceId }
					}
					return space
				})

				await reorderSpaces(updatedSpaces)

				if (draggedSpace.workspaceId !== workspaceId) {
					await updateSpaceWorkspace(draggedSpace.id, workspaceId, newOrder)
				}
			} catch (error) {
				console.error('Failed to reorder spaces:', error)
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
					handleSpaceClick(selectedKey)
				}
			}}
			renderEmptyState={() => (
				<div data-drop-target className="ml-11 mr-4">
					<CreateSpaceInWorkspace
						workspaceId={workspaceId}
						onSpaceCreated={(newSpace) => setSpaces([...spaces, newSpace])}
					/>
				</div>
			)}
		>
			{(space) => (
				<GridListItem
					textValue={space.name}
					className={({ isSelected, isFocusVisible }) => `
							flex flex-grow items-center justify-between text-gray-400 outline-none cursor-pointer hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200
							${isSelected ? 'bg-gray-700 border-l-4 border-blue-500 pl-3 text-zinc-50' : 'pl-4'}
							${isFocusVisible ? '' : ''}
						`}
				>
					<div className="flex flex-grow items-center justify-between group py-1">
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
								onPress={() => handleSpaceClick(space.id)}
								className="flex-grow text-left outline-none text-sm"
							>
								{space.name}
							</Button>
						</div>
						<div className="opacity-0 group-hover:opacity-100">
							<SpaceButtonMenu spaceId={space.id} spaceName={space.name} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}

export default Spaces
