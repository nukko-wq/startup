'use client'

import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
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
import { useRef, useCallback } from 'react'

interface SpacesProps {
	workspaceId: string
}

const Spaces = ({ workspaceId }: SpacesProps) => {
	const {
		spaces,
		activeSpaceId,
		setActiveSpaceId,
		setIsNavigating,
		reorderSpaces,
		setSpaces,
	} = useSpaces()
	const router = useRouter()

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

				setActiveSpaceId(spaceId)

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
				}, 500)
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

	const workspaceSpaces = spaces.filter(
		(space) => space.workspaceId === workspaceId,
	)

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
					className={({ isDropTarget }) => `
						drop-indicator
						${isDropTarget ? 'active' : ''}
					`}
				/>
			)
		},
		onDragEnd: (e) => {
			if (e.dropOperation === 'cancel') {
				setSpaces(spaces)
			}
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

				setSpaces(updatedSpaces.sort((a, b) => a.order - b.order))
				await reorderSpaces(updatedSpaces)

				if (draggedSpace.workspaceId !== workspaceId) {
					await fetch(`/api/spaces/${draggedSpace.id}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							workspaceId,
							order: newOrder,
						}),
					})
				}
			} catch (error) {
				console.error('Failed to reorder spaces:', error)
				setSpaces(spaces)
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

				const updatedSpaces = spaces.map((space) => {
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
					else if (space.id === insertedSpace.id) {
						return { ...space, workspaceId, order: newOrder }
					}
					return space
				})

				setSpaces(updatedSpaces.sort((a, b) => a.order - b.order))
				await reorderSpaces(updatedSpaces)

				await fetch(`/api/spaces/${insertedSpace.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						workspaceId,
						order: newOrder,
					}),
				})
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

				const newOrder = 1

				const updatedSpaces = spaces
					.map((space) => {
						if (space.workspaceId === workspaceId) {
							return { ...space, order: space.order + 1 }
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
				if (selectedKey) {
					handleSpaceClick(selectedKey)
				}
			}}
			renderEmptyState={() => (
				<div className="p-2 text-center text-gray-500 min-h-[30px] border-2 border-dashed border-zinc-700 rounded">
					Add Space to Workspace
				</div>
			)}
		>
			{(space) => (
				<GridListItem
					textValue={space.name}
					className={({ isSelected, isFocusVisible }) => `
						flex flex-grow items-center justify-between outline-none cursor-pointer hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200
						${isSelected ? 'bg-gray-700' : ''}
						${isFocusVisible ? '' : ''}
						${activeSpaceId === space.id ? 'border-l-4 border-blue-500 pl-3' : 'pl-4'}
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
							<Button
								onPress={() => handleSpaceClick(space.id)}
								className={`
										flex-grow text-left outline-none
										${
											activeSpaceId === space.id
												? 'text-zinc-200 font-medium hover:text-zinc-50 transition-colors duration-200'
												: 'text-gray-400 hover:text-zinc-50 transition-colors duration-200'
										}
									`}
							>
								{space.name}
							</Button>
						</div>
						<div className="opacity-0 group-hover:opacity-100">
							<SpaceButtonMenu
								spaceId={space.id}
								spaceName={space.name}
								setSpaces={setSpaces}
							/>
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}

export default Spaces
