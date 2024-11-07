'use client'

import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import { Space } from '@/app/types/space'
import { GripVertical } from 'lucide-react'
import {
	Button,
	GridList,
	GridListItem,
	useDragAndDrop,
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
		getItems: (keys) => {
			const space = workspaceSpaces.find((s) => s.id === Array.from(keys)[0])
			return [
				{
					'space-item': JSON.stringify(space),
					'text/plain': space?.name || '',
				},
			]
		},
		acceptedDragTypes: ['space-item'],
		getDropOperation: () => 'move',

		onReorder: async (e) => {
			try {
				const items = [...workspaceSpaces]
				const draggedIndex = items.findIndex(
					(item) => item.id === Array.from(e.keys)[0],
				)
				const targetIndex = items.findIndex((item) => item.id === e.target.key)
				const draggedItem = items[draggedIndex]

				items.splice(draggedIndex, 1)
				items.splice(
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1,
					0,
					draggedItem,
				)

				// 全体のspacesを更新
				const updatedSpaces = spaces.map((space) => {
					const reorderedSpace = items.find((item) => item.id === space.id)
					if (reorderedSpace) {
						return { ...space, order: items.indexOf(reorderedSpace) }
					}
					return space
				})

				await reorderSpaces(updatedSpaces)
			} catch (error) {
				console.error('Failed to update space order:', error)
				alert('スペースの並び順の更新に失敗しました')
			}
		},
	})

	return (
		<div className="flex flex-col">
			<GridList
				aria-label="Draggable spaces"
				items={workspaceSpaces}
				dragAndDropHooks={dragAndDropHooks}
				className="space-y-1 outline-none flex flex-col flex-grow"
			>
				{(space) => (
					<GridListItem
						key={space.id}
						textValue={space.name}
						className="flex items-center justify-between outline-none hover:bg-gray-700 hover:bg-opacity-50 group"
					>
						<GripVertical className="w-5 h-5 text-gray-500 mr-2 opacity-0 group-hover:opacity-100" />
						<Button
							onPress={() => handleSpaceClick(space.id)}
							className={`
							cursor-pointer transition-colors flex flex-grow outline-none
							${
								activeSpaceId === space.id
									? 'text-zinc-50 font-medium'
									: 'text-zinc-400 hover:text-zinc-50'
							}
						`}
						>
							{space.name}
						</Button>
						<SpaceButtonMenu
							spaceId={space.id}
							spaceName={space.name}
							setSpaces={setSpaces}
						/>
					</GridListItem>
				)}
			</GridList>
		</div>
	)
}

export default Spaces
