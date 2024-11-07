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
					className="drop-indicator h-0.5 bg-zinc-700 rounded"
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

				const targetIndex = workspaceSpaces.findIndex(
					(s) => s.id === e.target.key,
				)

				const targetSpace = workspaceSpaces[targetIndex]
				const newOrder =
					e.target.dropPosition === 'before'
						? targetSpace.order
						: targetSpace.order + 1

				const updatedSpaces = spaces.map((space) => {
					if (space.workspaceId === workspaceId) {
						if (space.id === draggedSpace.id) {
							return { ...space, order: newOrder, workspaceId }
						}
						if (e.target.dropPosition === 'before') {
							if (space.order >= newOrder) {
								return { ...space, order: space.order + 1 }
							}
						} else {
							if (space.order > targetSpace.order) {
								return { ...space, order: space.order + 1 }
							}
						}
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
					e.items.filter(isTextDropItem).map(async (item) => {
						const data = JSON.parse(await item.getText('space-item'))
						return data
					}),
				)

				const draggedSpace = items[0]
				if (!draggedSpace) return

				const newOrder = workspaceSpaces.length === 0 ? 1 : 1

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
				console.error('Failed to insert space:', error)
				setSpaces(spaces)
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
			className="flex flex-col"
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
					スペースをドロップしてください
				</div>
			)}
		>
			{(space) => (
				<GridListItem
					textValue={space.name}
					className={({ isSelected, isFocusVisible }) => `
						flex flex-grow items-center justify-between outline-none cursor-pointer hover:bg-gray-700 hover:bg-opacity-75 group
						${isSelected ? 'bg-gray-700' : ''}
						${isFocusVisible ? 'ring-2 ring-blue-500' : ''}
					`}
				>
					<div className="flex flex-grow items-center justify-between hover:bg-zinc-800 group rounded">
						<div className="flex items-center flex-grow gap-2">
							<div className="text-zinc-500">
								<Button
									slot="drag"
									className="cursor-grab"
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
												? 'text-zinc-50 font-medium'
												: 'text-zinc-400 hover:text-zinc-50'
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
