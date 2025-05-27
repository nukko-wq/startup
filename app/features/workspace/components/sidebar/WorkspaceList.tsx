'use client'

import SpaceList from '@/app/features/space/components/sidebar/SpaceList'
import { reorderSpaces } from '@/app/lib/redux/features/space/spaceAPI'
import { setSpaces } from '@/app/lib/redux/features/space/spaceSlice'
import { selectDefaultWorkspace } from '@/app/lib/redux/features/workspace/selector'
import { reorderWorkspaces } from '@/app/lib/redux/features/workspace/workSpaceAPI'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import {
	getDragDropErrorMessage,
	handleOptimisticUpdateError,
	reorderArray,
	updateOrder,
} from '@/app/lib/utils/dragAndDrop'
import {
	DragDropContext,
	Draggable,
	type DropResult,
	Droppable,
} from '@hello-pangea/dnd'
import { ChevronRight, Layers } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import DefaultWorkspaceRightMenu from './DefaultWorkspaceRightMenu'
import WorkspaceLeftMenu from './WorkspaceLeftMenu'
import WorkspaceRightMenu from './WorkspaceRightMenu'

const WorkspaceList = () => {
	const dispatch = useAppDispatch()
	const defaultWorkspace = useAppSelector(selectDefaultWorkspace)
	const allWorkspaces = useAppSelector((state) => state.workspace.workspaces)
	const allSpaces = useAppSelector((state) => state.space.spaces)
	// 折りたたみ状態を管理するstate
	const [collapsedWorkspaces, setCollapsedWorkspaces] = useState<Set<string>>(
		new Set(),
	)

	// 折りたたみトグル関数をメモ化
	const toggleCollapse = useCallback((workspaceId: string) => {
		setCollapsedWorkspaces((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(workspaceId)) {
				newSet.delete(workspaceId)
			} else {
				newSet.add(workspaceId)
			}
			return newSet
		})
	}, [])

	// ワークスペースの並び替えロジックをメモ化
	const handleWorkspaceReorder = useCallback(
		async (source: { index: number }, destination: { index: number }) => {
			// 配列の並び替えとorder更新
			const reorderedWorkspaces = reorderArray(
				allWorkspaces,
				source.index,
				destination.index,
			)
			const updatedWorkspaces = updateOrder(reorderedWorkspaces)

			// 楽観的更新
			dispatch(setWorkspaces(updatedWorkspaces))

			try {
				await dispatch(
					reorderWorkspaces(
						updatedWorkspaces.map((w, index: number) => ({
							id: w.id,
							order: index,
						})),
					),
				).unwrap()
			} catch (error) {
				const errorMessage = getDragDropErrorMessage('workspace', 'reorder')
				handleOptimisticUpdateError(error, errorMessage, () =>
					dispatch(setWorkspaces(allWorkspaces)),
				)
				throw error
			}
		},
		[dispatch, allWorkspaces],
	)

	// スペースの並び替えロジックをメモ化
	const handleSpaceReorder = useCallback(
		async (
			source: { droppableId: string; index: number },
			destination: { droppableId: string; index: number },
			draggableId: string,
		) => {
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
				// エラー時は元の状態に戻す
				dispatch(setSpaces(allSpaces))
				throw error
			}
		},
		[dispatch, allSpaces],
	)

	const onDragEnd = useCallback(
		async (result: DropResult) => {
			const { source, destination, type, draggableId } = result

			// 基本的な検証
			if (!destination) return
			if (
				source.droppableId === destination.droppableId &&
				source.index === destination.index
			)
				return

			try {
				// ワークスペースの並び替え
				if (type === 'workspace') {
					await handleWorkspaceReorder(source, destination)
					return
				}

				// スペースの並び替え
				if (type === 'space') {
					await handleSpaceReorder(source, destination, draggableId)
				}
			} catch (error) {
				// エラーハンドリングは各ハンドラー内で実行済み
				console.error(
					'ドラッグアンドドロップ操作でエラーが発生しました:',
					error,
				)
			}
		},
		[handleWorkspaceReorder, handleSpaceReorder],
	)

	// レンダリング用のワークスペースリストをメモ化
	const workspaceItems = useMemo(
		() =>
			allWorkspaces.map((workspace, index) => (
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
								<div className="flex flex-col grow justify-between">
									<div className="flex items-center justify-between group min-h-[40px] mt-1">
										<div className="flex items-center grow pl-3">
											<div
												{...(workspace.isDefault
													? {}
													: provided.dragHandleProps)}
												className={`${
													workspace.isDefault ? '' : 'cursor-grab'
												} flex items-center`}
												onClick={() =>
													!workspace.isDefault && toggleCollapse(workspace.id)
												}
											>
												{workspace.isDefault ? (
													<Layers className="w-6 h-6 text-gray-500" />
												) : (
													<ChevronRight
														className={`w-4 h-4 text-slate-500 ml-[4px] mr-[4px] transition-transform ${
															collapsedWorkspaces.has(workspace.id)
																? ''
																: 'rotate-90'
														}`}
													/>
												)}
											</div>
											<div className="flex items-center grow justify-between hover:border-b-2 hover:border-blue-500 pt-[2px] ml-2 border-b-2 border-transparent">
												<span className="font-medium text-gray-500">
													{workspace.id === defaultWorkspace?.id ? (
														<span className="text-gray-500">Spaces</span>
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
															<WorkspaceLeftMenu workspaceId={workspace.id} />
															<WorkspaceRightMenu workspace={workspace} />
														</>
													)}
												</div>
											</div>
										</div>
									</div>
									{/* SpaceListを条件付きでレンダリング */}
									{!collapsedWorkspaces.has(workspace.id) && (
										<SpaceList workspaceId={workspace.id} type="space" />
									)}
								</div>
							</div>
						</div>
					)}
				</Draggable>
			)),
		[allWorkspaces, defaultWorkspace, collapsedWorkspaces, toggleCollapse],
	)

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="">
				<Droppable droppableId="workspace-list" type="workspace">
					{(provided) => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							{workspaceItems}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</div>
		</DragDropContext>
	)
}

export default WorkspaceList
