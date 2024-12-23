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
import SpaceMenu from '@/app/features/space/components/sidebar/SpaceMenu'

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
				const workspaces = Array.from(allWorkspaces)
				const [movedWorkspace] = workspaces.splice(source.index, 1)
				workspaces.splice(destination.index, 0, movedWorkspace)

				const updatedWorkspaces = workspaces.map((workspace, index) => ({
					...workspace,
					order: index,
				}))

				// 楽観的更新
				dispatch(setWorkspaces(updatedWorkspaces))

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

				const spaces = Array.from(allSpaces)
				const targetSpace = spaces.find((space) => space.id === draggableId)

				if (!targetSpace) return

				// 楽観的更新のための新しい配列を作成
				const updatedSpaces = spaces.map((space) => {
					// 移動するスペース自体の更新
					if (space.id === draggableId) {
						return {
							...space,
							workspaceId: destinationId,
							order: destination.index,
						}
					}

					// 同じワークスペース内での移動の場合
					if (sourceId === destinationId) {
						if (space.workspaceId === sourceId) {
							if (targetSpace.order < destination.index) {
								// 上から下への移動
								if (
									space.order > targetSpace.order &&
									space.order <= destination.index
								) {
									return { ...space, order: space.order - 1 }
								}
							} else {
								// 下から上への移動
								if (
									space.order >= destination.index &&
									space.order < targetSpace.order
								) {
									return { ...space, order: space.order + 1 }
								}
							}
						}
					}
					// 異なるワークスペース間での移動の場合
					else {
						// 元のワークスペースの順序を更新
						if (
							space.workspaceId === sourceId &&
							space.order > targetSpace.order
						) {
							return { ...space, order: space.order - 1 }
						}
						// 移動先ワークスペースの順序を更新
						if (
							space.workspaceId === destinationId &&
							space.order >= destination.index
						) {
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
		},
		[dispatch, allSpaces, allWorkspaces],
	)

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="">
				<Droppable droppableId="workspace-list" type="workspace">
					{(provided) => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							{allWorkspaces.map((workspace, index) => (
								<Draggable
									key={workspace.id}
									draggableId={`workspace-${workspace.id}`}
									index={index}
									isDragDisabled={workspace.isDefault}
								>
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											className={`
												${workspace.isDefault ? 'cursor-default' : ''}
											`}
										>
											<div className="flex items-center">
												<div className="flex flex-col flex-grow justify-between">
													<div className="flex items-center justify-between group min-h-[40px] mt-1">
														<div className="flex items-center flex-grow">
															<div
																{...(workspace.isDefault
																	? {}
																	: provided.dragHandleProps)}
																className={`${workspace.isDefault ? '' : 'cursor-grab'} flex items-center`}
															>
																{workspace.isDefault ? (
																	<Layers className="w-6 h-6 text-gray-500" />
																) : (
																	<ChevronRight className="w-4 h-4 text-slate-500 ml-2" />
																)}
															</div>
															<div className="flex items-center flex-grow justify-between hover:border-b-2 hover:border-blue-500 pb-1 ml-2">
																<span className="font-medium text-gray-500">
																	{workspace.id === defaultWorkspace?.id ? (
																		<span className="text-gray-500">
																			Spaces
																		</span>
																	) : (
																		workspace.name
																	)}
																</span>
																<div className="flex items-center">
																	{workspace.id === defaultWorkspace?.id ? (
																		<DefaultWorkspaceRightMenu
																			workspaceId={workspace.id}
																		/>
																	) : (
																		<>
																			<WorkspaceLeftMenu
																				workspaceId={workspace.id}
																			/>
																			<WorkspaceRightMenu
																				workspace={workspace}
																			/>
																		</>
																	)}
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
