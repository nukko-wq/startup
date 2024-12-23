import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from '@hello-pangea/dnd'
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

interface SpaceListProps {
	workspaceId: string
}

const SpaceList = ({ workspaceId }: SpaceListProps) => {
	const router = useRouter()
	const dispatch = useAppDispatch()
	const spaces = useAppSelector((state) =>
		selectSpacesByWorkspaceId(state, workspaceId),
	)
	const allSpaces = useAppSelector(selectSpaces)
	const activeSpaceId = useAppSelector((state) => state.space.activeSpaceId)

	const onDragEnd = async (result: DropResult) => {
		const { source, destination } = result

		if (!destination) return

		const items = Array.from(spaces)
		const [reorderedItem] = items.splice(source.index, 1)
		items.splice(destination.index, 0, reorderedItem)

		// 楽観的更新
		const updatedSpaces = items.map((space, index) => ({
			...space,
			order: index,
		}))

		// 他のワークスペースのスペースを保持したまま更新
		const otherSpaces = allSpaces.filter(
			(space) => space.workspaceId !== workspaceId,
		)
		dispatch(setSpaces([...otherSpaces, ...updatedSpaces]))

		try {
			const spacesForApi = updatedSpaces.map((space, index) => ({
				id: space.id,
				order: index,
			}))

			const updatedFromApi = await dispatch(
				reorderSpaces({ workspaceId, spaces: spacesForApi }),
			).unwrap()
			dispatch(setSpaces(updatedFromApi))
		} catch (error) {
			console.error('スペースの並び替えに失敗しました:', error)
			// エラーの場合は元の状態に戻す
			dispatch(setSpaces(allSpaces))
		}
	}

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
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId={`space-list-${workspaceId}`}>
				{(provided) => (
					<div
						className="flex flex-col min-h-[40px]"
						ref={provided.innerRef}
						{...provided.droppableProps}
					>
						{spaces.length === 0 ? (
							<div className="ml-11 mr-4">Create a space</div>
						) : (
							spaces.map((space, index) => (
								<Draggable key={space.id} draggableId={space.id} index={index}>
									{(provided) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
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
														{...provided.dragHandleProps}
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
		</DragDropContext>
	)
}

export default SpaceList
