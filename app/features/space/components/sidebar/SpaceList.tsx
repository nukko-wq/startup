import SpaceMenu from '@/app/features/space/components/sidebar/SpaceMenu'
import { selectSortedSpacesByWorkspaceId } from '@/app/lib/redux/features/space/selector'
import { updateSpaceLastActive } from '@/app/lib/redux/features/space/spaceAPI'
import { setActiveSpace } from '@/app/lib/redux/features/space/spaceSlice'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { GripVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useCallback } from 'react'

interface SpaceListProps {
	workspaceId: string
	type: 'space'
}

const SpaceList = memo(({ workspaceId, type }: SpaceListProps) => {
	const router = useRouter()
	const dispatch = useAppDispatch()
	const spaces = useAppSelector((state) =>
		selectSortedSpacesByWorkspaceId(state, workspaceId),
	)
	const activeSpaceId = useAppSelector((state) => state.space.activeSpaceId)

	const handleSpaceClick = useCallback(
		async (spaceId: string) => {
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
		},
		[dispatch, workspaceId, router],
	)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, spaceId: string) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				handleSpaceClick(spaceId)
			}
		},
		[handleSpaceClick],
	)

	return (
		<Droppable droppableId={`space-list-${workspaceId}`} type={type}>
			{(provided, snapshot) => (
				<div
					className={`flex min-h-[40px] flex-col ${
						snapshot.isDraggingOver ? 'bg-gray-700 bg-opacity-25' : ''
					}`}
					ref={provided.innerRef}
					{...provided.droppableProps}
				>
					{spaces.length === 0 ? (
						<div className="mr-4 ml-11 flex min-h-[40px] items-center">
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
											flex grow justify-between text-gray-400
											hover:bg-gray-700 hover:bg-opacity-75 group transition-none pl-3
											${space.id === activeSpaceId ? 'border-blue-500 border-l-4 bg-gray-700 bg-opacity-75' : 'border-transparent border-l-4'}
											${snapshot.isDragging ? 'opacity-50' : ''}
										`}
									>
										<div className="group flex grow cursor-pointer items-center justify-between py-1">
											<div className="flex h-full grow items-center">
												<div
													className="flex h-full cursor-grab items-center pr-3"
													aria-label="drag handle"
												>
													<GripVertical className="h-4 w-4 text-slate-500" />
												</div>
												<div
													className="flex h-full grow cursor-pointer text-sm"
													onClick={(e) => {
														e.stopPropagation()
														handleSpaceClick(space.id)
													}}
													onKeyDown={(e) => handleKeyDown(e, space.id)}
													// biome-ignore lint/a11y/useSemanticElements: <explanation>
													role="button"
													tabIndex={0}
												>
													<div className="flex items-center">{space.name}</div>
												</div>
											</div>
											<div
												className="opacity-0 group-hover:opacity-100"
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}
											>
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
