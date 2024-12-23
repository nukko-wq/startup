'use client'

import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from '@hello-pangea/dnd'
import {
	selectDefaultWorkspace,
	selectNonDefaultWorkspaces,
} from '@/app/lib/redux/features/workspace/selector'
import { Layers, GripVertical, ChevronRight } from 'lucide-react'
import WorkspaceLeftMenu from './WorkspaceLeftMenu'
import DefaultWorkspaceRightMenu from './DefaultWorkspaceRightMenu'
import WorkspaceRightMenu from './WorkspaceRightMenu'
import SpaceList from '@/app/features/space/components/sidebar/SpaceList'
import { reorderWorkspaces } from '@/app/lib/redux/features/workspace/workSpaceAPI'
import { reorderSpaces } from '@/app/lib/redux/features/space/spaceAPI'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { setSpaces } from '@/app/lib/redux/features/space/spaceSlice'

const WorkspaceList = () => {
	const dispatch = useAppDispatch()
	const defaultWorkspace = useAppSelector(selectDefaultWorkspace)
	const nonDefaultWorkspaces = useAppSelector(selectNonDefaultWorkspaces)
	const allWorkspaces = useAppSelector((state) => state.workspace.workspaces)
	const allSpaces = useAppSelector((state) => state.space.spaces)

	const onDragEnd = async (result: DropResult) => {
		const { source, destination, type, draggableId } = result

		if (!destination) return

		// ワークスペースの並び替え
		if (type === 'workspace') {
			const workspaces = Array.from(nonDefaultWorkspaces)
			const [movedWorkspace] = workspaces.splice(source.index, 1)
			workspaces.splice(destination.index, 0, movedWorkspace)

			const updatedWorkspaces = workspaces.map((workspace, index) => ({
				...workspace,
				order: index,
			}))

			// デフォルトワークスペースを含む全ワークスペースの配列を作成
			const allUpdatedWorkspaces = defaultWorkspace
				? [defaultWorkspace, ...updatedWorkspaces]
				: updatedWorkspaces

			// 楽観的更新
			dispatch(setWorkspaces(allUpdatedWorkspaces))

			try {
				await dispatch(
					reorderWorkspaces(
						workspaces.map((w, index) => ({ id: w.id, order: index })),
					),
				).unwrap()
			} catch (error) {
				console.error('ワークスペースの並び替えに失敗しました:', error)
				dispatch(setWorkspaces(allWorkspaces))
			}
			return
		}

		// スペースの並び替え
		if (type === 'space') {
			const sourceId = source.droppableId.replace('space-list-', '')
			const destinationId = destination.droppableId.replace('space-list-', '')

			// 同じワークスペース内での並び替え
			if (sourceId === destinationId) {
				const spacesByWorkspace = allSpaces
					.filter((space) => space.workspaceId === sourceId)
					.sort((a, b) => a.order - b.order)

				const newSpaces = Array.from(spacesByWorkspace)
				const [movedSpace] = newSpaces.splice(source.index, 1)
				newSpaces.splice(destination.index, 0, movedSpace)

				// 楽観的更新
				const updatedSpaces = allSpaces.map((space) => {
					if (space.workspaceId !== sourceId) return space
					const index = newSpaces.findIndex((s) => s.id === space.id)
					if (index === -1) return space
					return { ...space, order: index }
				})

				dispatch(setSpaces(updatedSpaces))

				try {
					await dispatch(
						reorderSpaces({
							sourceWorkspaceId: sourceId,
							destinationWorkspaceId: destinationId,
							spaceId: draggableId,
							newOrder: destination.index,
						}),
					).unwrap()
				} catch (error) {
					console.error('スペースの並び替えに失敗しました:', error)
					dispatch(setSpaces(allSpaces))
				}
			} else {
				// 移動するスペースを見つける
				const spaceToMove = allSpaces.find((space) => space.id === draggableId)
				if (!spaceToMove) return

				// 更新後のスペースの配列を作成
				const updatedSpaces = allSpaces.map((space) => {
					// 異なるワークスペース間での移動
					if (space.workspaceId === sourceId) {
						if (space.id === draggableId) {
							return {
								...space,
								workspaceId: destinationId,
								order: destination.index,
							}
						}
						if (space.order > spaceToMove.order) {
							return { ...space, order: space.order - 1 }
						}
					}
					if (space.workspaceId === destinationId) {
						if (space.order >= destination.index) {
							return { ...space, order: space.order + 1 }
						}
					}
					return space
				})

				// 楽観的更新
				dispatch(setSpaces(updatedSpaces))

				try {
					await dispatch(
						reorderSpaces({
							sourceWorkspaceId: sourceId,
							destinationWorkspaceId: destinationId,
							spaceId: draggableId,
							newOrder: destination.index,
						}),
					).unwrap()
				} catch (error) {
					console.error('スペースの並び替えに失敗しました:', error)
					dispatch(setSpaces(allSpaces))
				}
			}
		}
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="">
				{/* デフォルトワークスペース */}
				<div className="">
					<div className="flex items-center">
						<div className="flex flex-col flex-grow justify-between">
							<div className="flex items-center justify-between mb-1">
								<div className="flex items-center">
									<div className="rounded-full py-1 pl-1 pr-2 ml-2">
										<Layers className="w-6 h-6 text-gray-500" />
									</div>
									<span className="font-medium text-gray-500">Spaces</span>
								</div>
								<DefaultWorkspaceRightMenu workspaceId={defaultWorkspace?.id} />
							</div>
						</div>
					</div>
					{defaultWorkspace && (
						<SpaceList workspaceId={defaultWorkspace.id} type="space" />
					)}
				</div>

				{/* 通常のワークスペース */}
				<Droppable droppableId="workspace-list" type="workspace">
					{(provided) => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							{nonDefaultWorkspaces.map((workspace, index) => (
								<Draggable
									key={workspace.id}
									draggableId={`workspace-${workspace.id}`}
									index={index}
								>
									{(provided) => (
										<div ref={provided.innerRef} {...provided.draggableProps}>
											<div className="flex items-center">
												<div className="flex flex-col flex-grow justify-between">
													<div className="flex items-center justify-between group min-h-[40px] mt-1">
														<div className="flex items-center flex-grow">
															<div
																{...provided.dragHandleProps}
																className="cursor-grab flex items-center"
															>
																<ChevronRight className="w-4 h-4 text-slate-500 ml-2" />
															</div>
															<div className="flex items-center flex-grow justify-between hover:border-b-2 hover:border-blue-500 pb-1 ml-2">
																<span className="font-medium text-gray-500">
																	{workspace.name}
																</span>
																<div className="flex items-center">
																	<WorkspaceLeftMenu
																		workspaceId={workspace.id}
																	/>
																	<WorkspaceRightMenu workspace={workspace} />
																</div>
															</div>
														</div>
													</div>
													<SpaceList workspaceId={workspace.id} type="space" />
												</div>
											</div>
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</div>
		</DragDropContext>
	)
}

export default WorkspaceList
