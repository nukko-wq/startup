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
import { reorderWorkspaces } from '@/app/lib/redux/features/workspace/workSpaceAPI'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { ChevronRight, Layers } from 'lucide-react'
import { Button } from 'react-aria-components'
import WorkspaceLeftMenu from '@/app/features/workspace/components/sidebar/WorkspaceLeftMenu'
import DefaultWorkspaceRightMenu from '@/app/features/workspace/components/sidebar/DefaultWorkspaceRightMenu'
import WorkspaceRightMenu from '@/app/features/workspace/components/sidebar/WorkspaceRightMenu'
import SpaceList from '@/app/features/space/components/sidebar/SpaceList'

const WorkspaceList = () => {
	const dispatch = useAppDispatch()
	const defaultWorkspace = useAppSelector(selectDefaultWorkspace)
	const nonDefaultWorkspaces = useAppSelector(selectNonDefaultWorkspaces)

	const onDragEnd = async (result: DropResult) => {
		const { source, destination } = result

		if (!destination) return

		const items = Array.from(nonDefaultWorkspaces)
		const [reorderedItem] = items.splice(source.index, 1)
		items.splice(destination.index, 0, reorderedItem)

		// 楽観的更新
		const updatedWorkspaces = items.map((workspace, index) => ({
			...workspace,
			order: index,
		}))

		// デフォルトワークスペースと結合
		const allWorkspaces = defaultWorkspace
			? [defaultWorkspace, ...updatedWorkspaces]
			: updatedWorkspaces

		dispatch(setWorkspaces(allWorkspaces))

		try {
			const workspacesForApi = updatedWorkspaces.map((workspace, index) => ({
				id: workspace.id,
				order: index,
			}))

			const updatedFromApi = await dispatch(
				reorderWorkspaces(workspacesForApi),
			).unwrap()
			dispatch(setWorkspaces(updatedFromApi))
		} catch (error) {
			console.error('ワークスペースの並び替えに失敗しました:', error)
			// エラーの場合は元の状態に戻す
			const originalWorkspaces = defaultWorkspace
				? [defaultWorkspace, ...nonDefaultWorkspaces]
				: nonDefaultWorkspaces
			dispatch(setWorkspaces(originalWorkspaces))
		}
	}

	return (
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
				{defaultWorkspace && <SpaceList workspaceId={defaultWorkspace.id} />}
			</div>

			{/* 通常のワークスペース */}
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId="workspaces">
					{(provided) => (
						<div
							className="flex flex-col"
							{...provided.droppableProps}
							ref={provided.innerRef}
						>
							{nonDefaultWorkspaces.map((workspace, index) => (
								<Draggable
									key={workspace.id}
									draggableId={workspace.id}
									index={index}
								>
									{(provided) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											className="outline-none"
										>
											<div className="flex items-center">
												<div className="flex flex-col flex-grow justify-between">
													<div className="flex items-center justify-between group min-h-[40px] mt-1">
														<div className="flex items-center flex-grow">
															<div
																className="flex items-center cursor-grab"
																{...provided.dragHandleProps}
															>
																<div className="rounded-full py-1 pl-1 pr-2 ml-2">
																	<ChevronRight className="w-6 h-6 text-gray-500" />
																</div>
															</div>
															<div className="flex items-center flex-grow justify-between hover:border-b-2 hover:border-blue-500 pb-1">
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
													<SpaceList workspaceId={workspace.id} />
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
			</DragDropContext>
		</div>
	)
}

export default WorkspaceList
