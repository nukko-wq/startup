'use client'

import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import { Space } from '@/app/types/space'
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

interface SpacesProps {
	workspaceId: string
}

const Spaces = ({ workspaceId }: SpacesProps) => {
	const { spaces, activeSpaceId, handleSpaceClick, reorderSpaces, setSpaces } =
		useSpaces()

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
					className={({ isDropTarget }) =>
						`drop-indicator ${isDropTarget ? 'active' : ''}`
					}
				/>
			)
		},
		async onInsert(e) {
			try {
				const items = await Promise.all(
					e.items
						.filter(isTextDropItem)
						.map(async (item) => JSON.parse(await item.getText('space-item'))),
				)

				const targetIndex = workspaceSpaces.findIndex(
					(s) => s.id === e.target.key,
				)
				const newOrder =
					e.target.dropPosition === 'before'
						? workspaceSpaces[targetIndex]?.order
						: workspaceSpaces[targetIndex]?.order + 1

				const updatedSpaces = spaces.map((space) => {
					if (items.some((item) => item.id === space.id)) {
						return { ...space, workspaceId, order: newOrder }
					}
					if (space.workspaceId === workspaceId && space.order >= newOrder) {
						return { ...space, order: space.order + 1 }
					}
					return space
				})

				await reorderSpaces(updatedSpaces)
			} catch (error) {
				console.error('Failed to insert spaces:', error)
			}
		},
		onReorder(e) {
			try {
				const draggedSpace = spaces.find((s) => s.id === Array.from(e.keys)[0])
				if (!draggedSpace) return

				const targetIndex = workspaceSpaces.findIndex(
					(s) => s.id === e.target.key,
				)
				const newOrder =
					e.target.dropPosition === 'before'
						? workspaceSpaces[targetIndex]?.order
						: workspaceSpaces[targetIndex]?.order + 1

				const updatedSpaces = spaces.map((space) => {
					if (space.id === draggedSpace.id) {
						return { ...space, order: newOrder }
					}
					if (space.workspaceId === workspaceId && space.order >= newOrder) {
						return { ...space, order: space.order + 1 }
					}
					return space
				})

				setSpaces(updatedSpaces)

				const payload = {
					items: updatedSpaces.map((space) => ({
						id: space.id,
						order: space.order,
					})),
				}

				fetch('/api/spaces/reorder', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				}).catch((error) => {
					console.error('Failed to reorder spaces:', error)
					setSpaces(spaces)
				})
			} catch (error) {
				console.error('Failed to reorder spaces:', error)
				setSpaces(spaces)
			}
		},
	})

	return (
		<GridList
			aria-label="Spaces in workspace"
			items={workspaceSpaces}
			dragAndDropHooks={dragAndDropHooks}
			className="flex flex-col space-y-1 outline-none min-h-[30px]"
			renderEmptyState={() => (
				<div className="p-2 text-center text-gray-500">No spaces yet</div>
			)}
		>
			{(space) => (
				<GridListItem
					textValue={space.name}
					className="outline-none cursor-pointer"
				>
					<div className="flex items-center justify-between p-1 hover:bg-zinc-800 group rounded">
						<div className="flex items-center flex-grow gap-2">
							<div className="opacity-0 group-hover:opacity-100">
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
									flex-grow text-left
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
