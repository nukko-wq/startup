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
import {
	ChevronRight,
	CircleChevronRight,
	GripVertical,
	Layers,
} from 'lucide-react'
import WorkspaceButtonMenu from './WorkspaceButtonMenu'
import Spaces from '@/app/features/sidebar/Spaces'
import SpacesMenu from '@/app/features/sidebar/SpacesMenu'

const WorkspaceInSidebar = () => {
	const { workspaces, defaultWorkspace, reorderWorkspaces, setWorkspaces } =
		useWorkspaces()

	// デフォルトワークスペース以外のワークスペースのみを対象とする
	const nonDefaultWorkspaces = workspaces.filter((w) => !w.isDefault)

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
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
		async onReorder(e) {
			try {
				const draggedWorkspace = nonDefaultWorkspaces.find(
					(w) => w.id === Array.from(e.keys)[0],
				)
				if (!draggedWorkspace) return

				const targetWorkspace = nonDefaultWorkspaces.find(
					(w) => w.id === e.target.key,
				)
				if (!targetWorkspace) return

				// 新しい順序を計算
				const sortedWorkspaces = [...nonDefaultWorkspaces].sort(
					(a, b) => a.order - b.order,
				)

				// ドラッグされたアイテムの新しい位置を決定
				const draggedIndex = sortedWorkspaces.findIndex(
					(w) => w.id === draggedWorkspace.id,
				)
				const targetIndex = sortedWorkspaces.findIndex(
					(w) => w.id === targetWorkspace.id,
				)

				// アイテムを移動
				if (e.target.dropPosition === 'before') {
					sortedWorkspaces.splice(draggedIndex, 1)
					const newIndex =
						targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
					sortedWorkspaces.splice(newIndex, 0, draggedWorkspace)
				} else {
					sortedWorkspaces.splice(draggedIndex, 1)
					const newIndex =
						targetIndex > draggedIndex ? targetIndex : targetIndex + 1
					sortedWorkspaces.splice(newIndex, 0, draggedWorkspace)
				}

				// orderを更新
				const reorderedWorkspaces = sortedWorkspaces.map(
					(workspace, index) => ({
						...workspace,
						order: index + 1,
					}),
				)

				// 一時的に状態を更新
				const updatedWorkspaces = defaultWorkspace
					? [defaultWorkspace, ...reorderedWorkspaces]
					: reorderedWorkspaces
				setWorkspaces(updatedWorkspaces)

				// APIリクエストを実行
				const payload = {
					items: reorderedWorkspaces.map((w) => ({
						id: w.id,
						order: w.order,
					})),
				}

				if (!payload.items || payload.items.length === 0) {
					throw new Error('Payload is empty')
				}

				const response = await fetch('/api/workspaces/reorder', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				})

				if (!response.ok) {
					throw new Error('Failed to reorder workspaces')
				}

				const data = await response.json()
				if (!data.success) {
					throw new Error(data.error || 'Failed to reorder workspaces')
				}
			} catch (error) {
				console.error('Failed to reorder workspaces:', error)
				// エラー時は元の状態に戻す
				setWorkspaces(workspaces)
			}
		},
		onDragEnd: (e) => {
			if (e.dropOperation === 'cancel') {
				setWorkspaces(workspaces)
			}
		},
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) => `
						drop-indicator
						${isDropTarget ? 'active' : ''}
					`}
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
			<div className="flex items-center justify-between px-4">
				<div className="flex items-center">
					<Layers className="w-5 h-5 text-zinc-50 mr-2" />
					<div className="font-semibold text-zinc-50">Spaces</div>
				</div>
				<SpacesMenu />
			</div>
			<GridList
				items={allWorkspaces}
				dragAndDropHooks={dragAndDropHooks}
				className="outline-none"
				selectionMode="single"
				aria-label="ワークスペース一覧"
			>
				{(workspace) => (
					<GridListItem
						key={workspace.id}
						textValue={workspace.name}
						className="outline-none"
					>
						<div className="flex items-center">
							<div className="flex flex-col flex-grow justify-between">
								<div className="flex items-center justify-between group">
									{/* ワークスペース名(Default Workspaceの場合は非表示) */}
									{!workspace.isDefault && (
										<div className="flex items-center cursor-grab">
											<Button
												slot="drag"
												className=" rounded-full py-1 pl-1 pr-2 ml-2"
											>
												<ChevronRight className="w-6 h-6 text-gray-500" />
											</Button>
											<span className="font-medium text-zinc-50">
												{workspace.name}
											</span>
										</div>
									)}
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
