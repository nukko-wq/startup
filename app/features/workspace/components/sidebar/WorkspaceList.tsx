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
import { useCallback } from 'react'

const WorkspaceList = () => {
	const dispatch = useAppDispatch()
	const defaultWorkspace = useAppSelector(selectDefaultWorkspace)
	const nonDefaultWorkspaces = useAppSelector(selectNonDefaultWorkspaces)
	const allWorkspaces = useAppSelector((state) => state.workspace.workspaces)
	const allSpaces = useAppSelector((state) => state.space.spaces)

	const onDragEnd = useCallback(
		async (result: DropResult) => {
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

				// 移動元と移動先のスペースを事前にフィルタリング
				const sourceSpaces = allSpaces
					.filter((space) => space.workspaceId === sourceId)
					.sort((a, b) => a.order - b.order)

				const destinationSpaces = allSpaces
					.filter((space) => space.workspaceId === destinationId)
					.sort((a, b) => a.order - b.order)

				// 同じワークスペース内での並び替え
				if (sourceId === destinationId) {
					const newSpaces = Array.from(sourceSpaces)
					const [movedSpace] = newSpaces.splice(source.index, 1)
					newSpaces.splice(destination.index, 0, movedSpace)

					// 楽観的更新の修正
					const updatedSpaces = allSpaces.map((space) => {
						if (space.workspaceId !== sourceId) return space
						const index = newSpaces.findIndex((s) => s.id === space.id)
						return {
							...space,
							order: index !== -1 ? index : space.order,
						}
					})

					dispatch(setSpaces(updatedSpaces.sort((a, b) => a.order - b.order)))

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
				// 異なるワークスペース間での移動
				else {
					const sourceItems = Array.from(sourceSpaces)
					const [movedSpace] = sourceItems.splice(source.index, 1)
					const destinationItems = Array.from(destinationSpaces)
					destinationItems.splice(destination.index, 0, {
						...movedSpace,
						workspaceId: destinationId,
					})

					// 楽観的更新の修正
					const updatedSpaces = allSpaces.map((space) => {
						if (space.id === movedSpace.id) {
							return {
								...space,
								workspaceId: destinationId,
								order: destination.index,
							}
						}

						if (space.workspaceId === sourceId) {
							const newIndex = sourceItems.findIndex((s) => s.id === space.id)
							return {
								...space,
								order: newIndex !== -1 ? newIndex : space.order,
							}
						}

						if (space.workspaceId === destinationId) {
							const newIndex = destinationItems.findIndex(
								(s) => s.id === space.id,
							)
							return {
								...space,
								order: newIndex !== -1 ? newIndex : space.order,
							}
						}

						return space
					})

					dispatch(setSpaces(updatedSpaces.sort((a, b) => a.order - b.order)))

					// APIコールを非同期で行う
					try {
						const response = await dispatch(
							reorderSpaces({
								sourceWorkspaceId: sourceId,
								destinationWorkspaceId: destinationId,
								spaceId: draggableId,
								newOrder: destination.index,
							}),
						).unwrap()

						// APIからの応答で最終的な状態を更新
						if (response) {
							dispatch(setSpaces(response))
						}
					} catch (error) {
						console.error('スペースの並び替えに失敗しました:', error)
						dispatch(setSpaces(allSpaces))
					}
				}
			}
		},
		[
			dispatch,
			allSpaces,
			allWorkspaces,
			defaultWorkspace,
			nonDefaultWorkspaces,
		],
	)

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
