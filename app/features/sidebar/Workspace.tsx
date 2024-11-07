'use client'

import { useWorkspaces } from '@/app/features/workspaces/contexts/WorkspaceContext'
import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import { Button } from 'react-aria-components'
import {
	GridList,
	GridListItem,
	useDragAndDrop,
	DropIndicator,
} from 'react-aria-components'
import { CircleChevronRight, GripVertical, Layers } from 'lucide-react'
import WorkspaceButtonMenu from './WorkspaceButtonMenu'
import Spaces from '@/app/features/sidebar/Spaces'

const WorkspaceInSidebar = () => {
	const { workspaces, defaultWorkspace, reorderWorkspaces } = useWorkspaces()

	// デフォルトワークスペース以外のワークスペースのみを対象とする
	const nonDefaultWorkspaces = workspaces.filter((w) => !w.isDefault)

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) => {
			const workspace = nonDefaultWorkspaces.find(
				(w) => w.id === Array.from(keys)[0],
			)
			return [
				{
					'workspace-item': JSON.stringify(workspace),
					'text/plain': workspace?.name || '',
				},
			]
		},
		acceptedDragTypes: ['workspace-item'],
		getDropOperation: () => 'move',

		onReorder: async (e) => {
			try {
				const items = [...nonDefaultWorkspaces]
				const draggedIndex = items.findIndex(
					(item) => item.id === Array.from(e.keys)[0],
				)
				const targetIndex = items.findIndex((item) => item.id === e.target.key)
				const draggedItem = items[draggedIndex]

				items.splice(draggedIndex, 1)
				items.splice(
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1,
					0,
					draggedItem,
				)

				const updatedWorkspaces = items.map((item, index) => ({
					...item,
					order: index + 1,
				}))

				const completeWorkspaces = defaultWorkspace
					? [defaultWorkspace, ...updatedWorkspaces]
					: updatedWorkspaces

				await reorderWorkspaces(completeWorkspaces)
			} catch (error) {
				console.error('Failed to update workspace order:', error)
				alert('ワークスペースの並び順の更新に失敗しました')
			}
		},
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`workspace-drop-indicator ${isDropTarget ? 'active' : ''}`
					}
				/>
			)
		},
	})

	// デフォルトワークスペースを先頭に、その後に並び替え可能なワークスペースを配置
	const allWorkspaces = defaultWorkspace
		? [defaultWorkspace, ...nonDefaultWorkspaces]
		: nonDefaultWorkspaces

	return (
		<div className="mt-4">
			<div className="flex items-center px-4">
				<Layers className="w-5 h-5 text-zinc-50 mr-2" />
				<div className="font-semibold text-zinc-50">Workspaces</div>
			</div>
			<GridList
				items={allWorkspaces}
				dragAndDropHooks={dragAndDropHooks}
				className="outline-none mt-2"
				selectionMode="single"
			>
				{(workspace) => (
					<GridListItem
						key={workspace.id}
						textValue={workspace.name}
						className="outline-none"
					>
						<div className="flex items-center">
							<div className="flex flex-col flex-grow justify-between py-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center px-4">
										<Button slot="drag">
											<CircleChevronRight className="w-5 h-5 text-gray-500 mr-2" />
										</Button>
										<span className="font-medium text-zinc-50">
											{workspace.name}
										</span>
									</div>
									{!workspace.isDefault && (
										<WorkspaceButtonMenu
											workspaceId={workspace.id}
											workspaceName={workspace.name}
										/>
									)}
								</div>
								{/* ワークスペースに所属するスペースを表示 */}
								<div className="mt-2 space-y-1">
									<Spaces workspaceId={workspace.id} />
								</div>
							</div>
						</div>
					</GridListItem>
				)}
			</GridList>
		</div>
	)
}

export default WorkspaceInSidebar
