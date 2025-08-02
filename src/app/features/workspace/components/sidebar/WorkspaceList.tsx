'use client'

import SpaceList from '@/app/features/space/components/sidebar/SpaceList'
import { workspaceSchema } from '@/app/features/workspace/schemas/workSpaceSchema'
import { reorderSpaces } from '@/app/lib/redux/features/space/spaceAPI'
import { setSpaces } from '@/app/lib/redux/features/space/spaceSlice'
import { selectDefaultWorkspace } from '@/app/lib/redux/features/workspace/selector'
import {
	reorderWorkspaces,
	updateWorkspace,
} from '@/app/lib/redux/features/workspace/workSpaceAPI'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import type { Space } from '@/app/lib/redux/features/space/types/space'
import type { Workspace } from '@/app/lib/redux/features/workspace/types/workspace'
import {
	getDragDropErrorMessage,
	handleOptimisticUpdateError,
	reorderArray,
	updateOrder,
} from '@/app/lib/utils/dragAndDrop'
import {
	DragDropContext,
	Draggable,
	type DraggableProvidedDragHandleProps,
	type DraggableProvidedDraggableProps,
	type DropResult,
	Droppable,
} from '@hello-pangea/dnd'
import { ChevronRight, Layers } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { ZodError } from 'zod'
import DefaultWorkspaceRightMenu from './DefaultWorkspaceRightMenu'
import WorkspaceLeftMenu from './WorkspaceLeftMenu'
import WorkspaceRightMenu from './WorkspaceRightMenu'

interface WorkspaceItemProps {
	workspace: Workspace
	defaultWorkspace: Workspace | null
	allSpaces: Space[]
	isCollapsed: boolean
	isEditing: boolean
	editingName: string
	validationError: string | null
	inputRef: React.RefObject<HTMLInputElement | null>
	onToggleCollapse: (workspaceId: string) => void
	onStartEdit: (workspaceId: string, name: string) => void
	onEditingNameChange: (name: string) => void
	onKeyDown: (e: React.KeyboardEvent) => void
	onBlur: () => void
	isDragging: boolean
}

const WorkspaceItem = memo(
	forwardRef<
		HTMLDivElement,
		WorkspaceItemProps & {
			style?: React.CSSProperties
		} & DraggableProvidedDraggableProps &
			Partial<DraggableProvidedDragHandleProps>
	>(
		(
			{
				workspace,
				defaultWorkspace,
				allSpaces,
				isCollapsed,
				isEditing,
				editingName,
				validationError,
				inputRef,
				onToggleCollapse,
				onStartEdit,
				onEditingNameChange,
				onKeyDown,
				onBlur,
				isDragging,
				style,
				...dragProps
			},
			ref,
		) => {
			return (
				<div
					ref={ref}
					{...dragProps}
					style={style}
					className={`
						${workspace.isDefault ? 'cursor-default' : ''}
						${isDragging ? 'opacity-75' : ''}
					`}
				>
					<div className="flex items-center">
						<div className="flex flex-col grow justify-between">
							<div className="flex items-center justify-between group min-h-[40px] mt-1">
								<div className="flex items-center grow pl-3">
									<button
										type="button"
										className={`${
											workspace.isDefault ? '' : 'cursor-grab'
										} flex items-center bg-transparent border-none p-0 outline-none`}
										onClick={() =>
											!workspace.isDefault && onToggleCollapse(workspace.id)
										}
										onKeyDown={(e) => {
											if ((e.key === 'Enter' || e.key === ' ') && !workspace.isDefault) {
												e.preventDefault()
												onToggleCollapse(workspace.id)
											}
										}}
										disabled={workspace.isDefault}
										aria-label={workspace.isDefault ? 'デフォルトワークスペース' : isCollapsed ? 'ワークスペースを展開' : 'ワークスペースを折りたたむ'}
									>
										{workspace.isDefault ? (
											<Layers className="w-6 h-6 text-gray-500" />
										) : (
											<ChevronRight
												className={`w-4 h-4 text-slate-500 ml-[4px] mr-[4px] transition-transform ${
													isCollapsed ? '' : 'rotate-90'
												}`}
											/>
										)}
									</button>
									<div className="flex items-center grow justify-between hover:border-b-2 hover:border-blue-500 pt-[2px] ml-2 border-b-2 border-transparent">
										{workspace.id === defaultWorkspace?.id ? (
											<span className="font-medium text-gray-500">Spaces</span>
										) : isEditing ? (
											<div className="w-full">
												<input
													ref={inputRef}
													type="text"
													value={editingName}
													onChange={(e) => onEditingNameChange(e.target.value)}
													onKeyDown={onKeyDown}
													onBlur={onBlur}
													className="font-medium bg-transparent border-none outline-none p-0 w-full text-gray-500"
												/>
												{validationError && (
													<div className="text-red-400 text-[11px] mt-1">
														{validationError}
													</div>
												)}
											</div>
										) : (
											<button
												type="button"
												className="font-medium text-gray-500 cursor-pointer hover:text-gray-700 bg-transparent border-none outline-none p-0 text-left w-full"
												onClick={() => onStartEdit(workspace.id, workspace.name)}
												onKeyDown={(e) => {
													if (e.key === 'Enter' || e.key === ' ') {
														e.preventDefault()
														onStartEdit(workspace.id, workspace.name)
													}
												}}
											>
												{workspace.name}
											</button>
										)}
										<div className="flex items-center">
											{workspace.id === defaultWorkspace?.id ? (
												<DefaultWorkspaceRightMenu workspaceId={workspace.id} />
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
							{!isCollapsed && (
								<SpaceList workspaceId={workspace.id} type="space" />
							)}
						</div>
					</div>
				</div>
			)
		},
	),
)

WorkspaceItem.displayName = 'WorkspaceItem'

const WorkspaceList = () => {
	const dispatch = useAppDispatch()
	const defaultWorkspace = useAppSelector(selectDefaultWorkspace)
	const allWorkspaces = useAppSelector((state) => state.workspace.workspaces)
	const allSpaces = useAppSelector((state) => state.space.spaces)

	const [uiState, setUiState] = useReducer(
		(
			state: {
				collapsedWorkspaces: Set<string>
				editingWorkspaceId: string | null
				editingName: string
				validationError: string | null
			},
			action:
				| { type: 'TOGGLE_COLLAPSE'; workspaceId: string }
				| { type: 'START_EDITING'; workspaceId: string; name: string }
				| { type: 'UPDATE_EDITING_NAME'; name: string }
				| { type: 'SET_VALIDATION_ERROR'; error: string | null }
				| { type: 'CANCEL_EDITING' }
				| { type: 'FINISH_EDITING' },
		) => {
			switch (action.type) {
				case 'TOGGLE_COLLAPSE': {
					const newSet = new Set(state.collapsedWorkspaces)
					if (newSet.has(action.workspaceId)) {
						newSet.delete(action.workspaceId)
					} else {
						newSet.add(action.workspaceId)
					}
					return { ...state, collapsedWorkspaces: newSet }
				}
				case 'START_EDITING':
					return {
						...state,
						editingWorkspaceId: action.workspaceId,
						editingName: action.name,
						validationError: null,
					}
				case 'UPDATE_EDITING_NAME':
					return { ...state, editingName: action.name }
				case 'SET_VALIDATION_ERROR':
					return { ...state, validationError: action.error }
				case 'CANCEL_EDITING':
				case 'FINISH_EDITING':
					return {
						...state,
						editingWorkspaceId: null,
						editingName: '',
						validationError: null,
					}
				default:
					return state
			}
		},
		{
			collapsedWorkspaces: new Set<string>(),
			editingWorkspaceId: null,
			editingName: '',
			validationError: null,
		},
	)

	const inputRef = useRef<HTMLInputElement | null>(null)

	const startEditing = useCallback((workspaceId: string, currentName: string) => {
		setUiState({ type: 'START_EDITING', workspaceId, name: currentName })
	}, [])

	const saveEdit = useCallback(async () => {
		if (!uiState.editingWorkspaceId) {
			setUiState({ type: 'FINISH_EDITING' })
			return
		}

		try {
			const validatedData = workspaceSchema.parse({ name: uiState.editingName.trim() })

			await dispatch(
				updateWorkspace({
					id: uiState.editingWorkspaceId,
					name: validatedData.name,
				}),
			).unwrap()

			setUiState({ type: 'FINISH_EDITING' })
		} catch (error) {
			if (error instanceof ZodError) {
				const firstIssue = error.issues?.[0]
				if (firstIssue) {
					setUiState({ type: 'SET_VALIDATION_ERROR', error: firstIssue.message })
					return
				}
			}

			console.error('ワークスペース名の更新でエラーが発生しました:', error)
			setUiState({ type: 'FINISH_EDITING' })
		}
	}, [dispatch, uiState.editingWorkspaceId, uiState.editingName])

	const cancelEdit = useCallback(() => {
		setUiState({ type: 'CANCEL_EDITING' })
	}, [])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				e.preventDefault()
				saveEdit()
			} else if (e.key === 'Escape') {
				e.preventDefault()
				cancelEdit()
			}
		},
		[saveEdit, cancelEdit],
	)

	const handleBlur = useCallback(() => {
		saveEdit()
	}, [saveEdit])

	useEffect(() => {
		if (uiState.editingWorkspaceId && inputRef.current) {
			inputRef.current.focus()
			inputRef.current.select()
		}
	}, [uiState.editingWorkspaceId])

	const toggleCollapse = useCallback((workspaceId: string) => {
		setUiState({ type: 'TOGGLE_COLLAPSE', workspaceId })
	}, [])

	const handleWorkspaceReorder = useCallback(
		async (source: { index: number }, destination: { index: number }) => {
			const reorderedWorkspaces = reorderArray(
				allWorkspaces,
				source.index,
				destination.index,
			)
			const updatedWorkspaces = updateOrder(reorderedWorkspaces)

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

			const finalOrder = destination.index

			let updatedSpaces: typeof spaces

			if (sourceId === destinationId) {
				const workspaceSpaces = spaces
					.filter((space) => space.workspaceId === sourceId)
					.sort((a, b) => a.order - b.order)

				const sourceIndex = workspaceSpaces.findIndex(
					(space) => space.id === draggableId,
				)

				const reorderedSpaces = [...workspaceSpaces]
				const [movedSpace] = reorderedSpaces.splice(sourceIndex, 1)
				reorderedSpaces.splice(finalOrder, 0, movedSpace)

				const reorderedWorkspaceSpaces = reorderedSpaces.map(
					(space, index) => ({
						...space,
						order: index,
					}),
				)

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
				updatedSpaces = spaces.filter((space) => space.id !== draggableId)

				updatedSpaces = updatedSpaces.map((space) => {
					if (
						space.workspaceId === sourceId &&
						space.order > targetSpace.order
					) {
						return { ...space, order: space.order - 1 }
					}
					return space
				})

				updatedSpaces = updatedSpaces.map((space) => {
					if (
						space.workspaceId === destinationId &&
						space.order >= finalOrder
					) {
						return { ...space, order: space.order + 1 }
					}
					return space
				})

				const movedSpace = {
					...targetSpace,
					workspaceId: destinationId,
					order: finalOrder,
				}
				updatedSpaces.push(movedSpace)
			}

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

			if (!destination) return
			if (
				source.droppableId === destination.droppableId &&
				source.index === destination.index
			)
				return

			try {
				if (type === 'workspace') {
					await handleWorkspaceReorder(source, destination)
					return
				}

				if (type === 'space') {
					await handleSpaceReorder(source, destination, draggableId)
				}
			} catch (error) {
				console.error(
					'ドラッグアンドドロップ操作でエラーが発生しました:',
					error,
				)
			}
		},
		[handleWorkspaceReorder, handleSpaceReorder],
	)

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
						<WorkspaceItem
							ref={provided.innerRef}
							{...provided.draggableProps}
							{...(provided.dragHandleProps || {})}
							workspace={workspace}
							defaultWorkspace={defaultWorkspace ?? null}
							allSpaces={allSpaces}
							isCollapsed={uiState.collapsedWorkspaces.has(workspace.id)}
							isEditing={uiState.editingWorkspaceId === workspace.id}
							editingName={uiState.editingName}
							validationError={uiState.validationError}
							inputRef={inputRef}
							onToggleCollapse={toggleCollapse}
							onStartEdit={startEditing}
							onEditingNameChange={(name) =>
								setUiState({ type: 'UPDATE_EDITING_NAME', name })
							}
							onKeyDown={handleKeyDown}
							onBlur={handleBlur}
							isDragging={snapshot.isDragging}
						/>
					)}
				</Draggable>
			)),
		[
			allWorkspaces,
			defaultWorkspace,
			allSpaces,
			uiState.collapsedWorkspaces,
			uiState.editingWorkspaceId,
			uiState.editingName,
			uiState.validationError,
			toggleCollapse,
			startEditing,
			handleKeyDown,
			handleBlur,
		],
	)

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="flex flex-col w-full p-2">
				<Droppable droppableId="workspaces" type="workspace">
					{(provided) => (
						<div
							ref={provided.innerRef}
							{...provided.droppableProps}
							className="flex flex-col gap-0.5"
						>
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