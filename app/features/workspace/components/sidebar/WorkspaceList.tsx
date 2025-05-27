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

			// 移動先ワークスペースのスペースを取得してソート（移動するスペースを除く）
			const destinationSpaces = spaces
				.filter(
					(space) =>
						space.workspaceId === destinationId && space.id !== draggableId,
				)
				.sort((a, b) => a.order - b.order)

			// destination.indexは最終的な位置を示すため、そのまま使用
			const finalOrder = destination.index

			// 楽観的更新: より正確なロジックで状態を更新
			let updatedSpaces: typeof spaces

			if (sourceId === destinationId) {
				// 同じワークスペース内での移動
				const workspaceSpaces = spaces
					.filter((space) => space.workspaceId === sourceId)
					.sort((a, b) => a.order - b.order)

				// @hello-pangea/dndの動作をシミュレート
				// destination.indexは最終的な配列での位置を示す
				const sourceIndex = workspaceSpaces.findIndex(
					(space) => space.id === draggableId,
				)

				// 配列を複製して並び替えを実行
				const reorderedSpaces = [...workspaceSpaces]

				// 元の位置から削除
				const [movedSpace] = reorderedSpaces.splice(sourceIndex, 1)

				// 新しい位置に挿入
				reorderedSpaces.splice(finalOrder, 0, movedSpace)

				// 順序を再設定
				const reorderedWorkspaceSpaces = reorderedSpaces.map(
					(space, index) => ({
						...space,
						order: index,
					}),
				)

				// 他のワークスペースのスペースと結合
				updatedSpaces = spaces.map((space) => {
					if (space.workspaceId === sourceId) {
						const reorderedSpace = reorderedWorkspaceSpaces.find(
							(s) => s.id === space.id,
						)
						return reorderedSpace || space
					}
					return space
				})
			} else {
				// 異なるワークスペース間での移動
				// 1. 移動するスペースを除いた配列を作成
				updatedSpaces = spaces.filter((space) => space.id !== draggableId)

				// 2. 元のワークスペースのスペースの順序を調整
				updatedSpaces = updatedSpaces.map((space) => {
					if (
						space.workspaceId === sourceId &&
						space.order > targetSpace.order
					) {
						return { ...space, order: space.order - 1 }
					}
					return space
				})

				// 3. 移動先ワークスペースのスペースの順序を調整
				updatedSpaces = updatedSpaces.map((space) => {
					if (
						space.workspaceId === destinationId &&
						space.order >= finalOrder
					) {
						return { ...space, order: space.order + 1 }
					}
					return space
				})

				// 4. 移動するスペースを新しい位置に追加
				const movedSpace = {
					...targetSpace,
					workspaceId: destinationId,
					order: finalOrder,
				}
				updatedSpaces.push(movedSpace)
			}

			// デバッグ用ログ（開発環境のみ）
			if (process.env.NODE_ENV === 'development') {
				const workspaceSpacesBefore = spaces
					.filter((space) => space.workspaceId === sourceId)
					.sort((a, b) => a.order - b.order)
					.map((s) => ({ id: s.id, order: s.order, name: s.name }))

				const workspaceSpacesAfter = updatedSpaces
					.filter((space) => space.workspaceId === sourceId)
					.sort((a, b) => a.order - b.order)
					.map((s) => ({ id: s.id, order: s.order, name: s.name }))

				console.log('Space reorder debug:', {
					sourceId,
					destinationId,
					draggableId,
					finalOrder,
					targetSpaceOrder: targetSpace.order,
					destinationIndex: destination.index,
					isSameWorkspace: sourceId === destinationId,
					workspaceSpacesBefore,
					workspaceSpacesAfter,
				})
			}

			// 楽観的更新
			dispatch(setSpaces(updatedSpaces))

			try {
				await dispatch(
					reorderSpaces({
						sourceWorkspaceId: sourceId,
						destinationWorkspaceId: destinationId,
						spaceId: draggableId,
						newOrder: finalOrder,
					}),
				).unwrap()
			} catch (error) {
				const errorMessage = getDragDropErrorMessage('space', 'reorder')
				handleOptimisticUpdateError(error, errorMessage, () =>
					dispatch(setSpaces(allSpaces)),
				)
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
