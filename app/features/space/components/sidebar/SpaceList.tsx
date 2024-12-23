import { Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { GripVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import {
	selectSpacesByWorkspaceId,
	selectSpaces,
} from '@/app/lib/redux/features/space/selector'
import {
	setSpaces,
	setActiveSpace,
} from '@/app/lib/redux/features/space/spaceSlice'
import {
	updateSpaceLastActive,
	reorderSpaces,
} from '@/app/lib/redux/features/space/spaceAPI'
import SpaceMenu from '@/app/features/space/components/sidebar/SpaceMenu'
import { memo } from 'react'

interface SpaceListProps {
	workspaceId: string
	type: 'space'
}

const SpaceList = memo(({ workspaceId, type }: SpaceListProps) => {
	const router = useRouter()
	const dispatch = useAppDispatch()
	const spaces = useAppSelector((state) =>
		selectSpacesByWorkspaceId(state, workspaceId),
	).sort((a, b) => a.order - b.order)
	const allSpaces = useAppSelector(selectSpaces)
	const activeSpaceId = useAppSelector((state) => state.space.activeSpaceId)

	const handleSpaceClick = async (spaceId: string) => {
		try {
			dispatch(setActiveSpace(spaceId))
			dispatch(
				updateSpaceLastActive({
					spaceId,
					workspaceId,
				}),
			)
			router.push(`/space/${spaceId}`, {
				scroll: false,
			})
		} catch (error) {
			console.error('スペースの切り替えに失敗しました:', error)
		}
	}

	return (
		<Droppable droppableId={`space-list-${workspaceId}`} type={type}>
			{(provided, snapshot) => (
				<div
					className={`flex flex-col min-h-[40px] ${
						snapshot.isDraggingOver ? 'bg-gray-700 bg-opacity-25' : ''
					}`}
					ref={provided.innerRef}
					{...provided.droppableProps}
				>
					{spaces.length === 0 ? (
						<div className="ml-11 mr-4 min-h-[40px] flex items-center">
							{snapshot.isDraggingOver ? (
								<div className="text-gray-400">Drop space here</div>
							) : (
								<div className="text-gray-400">Create a space</div>
							)}
						</div>
					) : (
						spaces.map((space, index) => (
							<Draggable key={space.id} draggableId={space.id} index={index}>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										style={{
											...provided.draggableProps.style,
										}}
										className={`
											flex flex-grow justify-between text-gray-400 cursor-pointer 
											hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200 pl-3
											${space.id === activeSpaceId ? 'bg-gray-700 bg-opacity-75 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
										`}
										onClick={() => handleSpaceClick(space.id)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault()
												handleSpaceClick(space.id)
											}
										}}
										// biome-ignore lint/a11y/useSemanticElements: <explanation>
										role="button"
										tabIndex={0}
									>
										<div className="flex flex-grow items-center justify-between py-1 group">
											<div className="flex items-center flex-grow">
												<div
													className="cursor-grab flex items-center pr-3"
													aria-label="drag handle"
												>
													<GripVertical className="w-4 h-4 text-slate-500" />
												</div>
												<div className="text-left text-sm">{space.name}</div>
											</div>
											<div className="opacity-0 group-hover:opacity-100">
												<SpaceMenu spaceId={space.id} />
											</div>
										</div>
									</div>
								)}
							</Draggable>
						))
					)}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	)
})

export default SpaceList
