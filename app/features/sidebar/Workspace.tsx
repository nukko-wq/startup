'use client'

import { useWorkspaces } from '@/app/features/workspaces/contexts/WorkspaceContext'
import { Button } from 'react-aria-components'
import { GridList, GridListItem, useDragAndDrop } from 'react-aria-components'
import { ChevronRight, Layers, Layers3 } from 'lucide-react'
import WorkspaceButtonMenu from './WorkspaceButtonMenu'
import Spaces from '@/app/features/sidebar/Spaces'
import SpacesMenu from './SpacesMenu'

const WorkspaceInSidebar = () => {
	const { workspaces, defaultWorkspace, reorderWorkspaces, setWorkspaces } =
		useWorkspaces()

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) => {
			const workspace = workspaces.find((w) => w.id === Array.from(keys)[0])
			// Default Workspaceの場合はドラッグを無効化
			if (workspace?.isDefault) return []

			return [
				{
					'workspace-id': String(workspace?.id),
					'text/plain': workspace?.name || '',
				},
			]
		},
		acceptedDragTypes: ['workspace-id'],
		getDropOperation: (target) => {
			// Default Workspaceへのドロップを防ぐ
			if (target?.type === 'item') {
				const workspace = workspaces.find((w) => w.id === target.key)
				return workspace?.isDefault ? 'cancel' : 'move'
			}
			return 'move'
		},
		renderDropIndicator(target) {
			return (
				<div
					className={`drop-indicator ${target.type === 'item' ? 'active' : ''}`}
				/>
			)
		},
		async onReorder(e) {
			const previousWorkspaces = [...workspaces]
			try {
				const draggedId = Array.from(e.keys)[0] as string
				const targetId = e.target.key as string

				// ドラッグ元またはドロップ先がDefault Workspaceの場合は処理を中止
				const draggedWorkspace = workspaces.find((w) => w.id === draggedId)
				const targetWorkspace = workspaces.find((w) => w.id === targetId)
				if (draggedWorkspace?.isDefault || targetWorkspace?.isDefault) return

				const reorderableWorkspaces = workspaces.filter((w) => !w.isDefault)
				const draggedIndex = reorderableWorkspaces.findIndex(
					(w) => w.id === draggedId,
				)
				const targetIndex = reorderableWorkspaces.findIndex(
					(w) => w.id === targetId,
				)

				if (draggedIndex === -1 || targetIndex === -1) return

				// 新しい順序を計算
				const newWorkspaces = [...reorderableWorkspaces]
				const [draggedItem] = newWorkspaces.splice(draggedIndex, 1)
				const insertAt =
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1
				newWorkspaces.splice(insertAt, 0, draggedItem)

				// orderを1から振り直し
				const updatedWorkspaces = newWorkspaces.map((workspace, index) => ({
					...workspace,
					order: index + 1,
				}))

				// 楽観的更新：即座にUIを更新
				setWorkspaces(
					workspaces.map((w) => {
						if (w.isDefault) return w
						const updated = updatedWorkspaces.find((u) => u.id === w.id)
						return updated || w
					}),
				)

				// APIリクエストのペイロード
				const payload = {
					items: updatedWorkspaces.map((w) => ({
						id: w.id,
						order: w.order,
					})),
				}

				// バックグラウンドでAPIリクエストを実行
				await reorderWorkspaces(payload)
			} catch (error) {
				console.error('Reorder error:', error)
				setWorkspaces(previousWorkspaces)
			}
		},
	})

	return (
		<div className="space-y-1">
			{/* Default Workspace */}
			{defaultWorkspace && (
				<div className="mb-4">
					<div className="flex items-center">
						<div className="flex flex-col flex-grow justify-between">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className="rounded-full py-1 pl-1 pr-2 ml-2">
										<Layers className="w-6 h-6 text-gray-500" />
									</div>
									<span className="font-medium text-gray-500">Spaces</span>
								</div>
								<SpacesMenu />
							</div>
							<div className="mt-2 space-y-1">
								<Spaces workspaceId={defaultWorkspace.id} />
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 通常のワークスペース */}
			<GridList
				aria-label="Workspaces"
				items={workspaces.filter((w) => !w.isDefault)}
				dragAndDropHooks={dragAndDropHooks}
				className="flex flex-col outline-none"
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
										<div className="flex items-center flex-grow mt-6">
											<div className="flex items-center cursor-grab">
												<Button
													slot="drag"
													className=" rounded-full py-1 pl-1 pr-2 ml-2"
												>
													<ChevronRight className="w-6 h-6 text-gray-500" />
												</Button>
											</div>
											<div className="flex items-center flex-grow justify-between hover:border-b-2 hover:border-blue-500 pb-1">
												{/* ワークスペース名 */}
												<span className="font-medium text-gray-500">
													{workspace.name}
												</span>
												<WorkspaceButtonMenu
													workspaceId={workspace.id}
													workspaceName={workspace.name}
												/>
											</div>
										</div>
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
