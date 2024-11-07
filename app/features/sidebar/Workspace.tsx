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

	// デフォルトワークスペース以外のワークスペースを取得
	const nonDefaultWorkspaces = workspaces.filter((w) => !w.isDefault)

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) => {
			return [...keys].map((key) => ({
				'workspace-id': String(key),
				'text/plain': String(key),
			}))
		},
		async onReorder(e) {
			try {
				const draggedId = Array.from(e.keys)[0] as string
				const targetId = e.target.key as string

				// 現在のワークスペースの配列をコピー
				const currentWorkspaces = [...nonDefaultWorkspaces]

				const draggedIndex = currentWorkspaces.findIndex(
					(w) => w.id === draggedId,
				)
				const targetIndex = currentWorkspaces.findIndex(
					(w) => w.id === targetId,
				)

				if (draggedIndex === -1 || targetIndex === -1) {
					console.log('Invalid indexes:', { draggedIndex, targetIndex })
					return
				}

				// アイテムを移動
				const [draggedItem] = currentWorkspaces.splice(draggedIndex, 1)
				const insertIndex =
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1
				currentWorkspaces.splice(insertIndex, 0, draggedItem)

				// 新しい順序を割り当て
				const reorderedWorkspaces = currentWorkspaces.map(
					(workspace, index) => ({
						...workspace,
						order: index + 1,
					}),
				)

				// APIに送信するペイロードを作成
				const requestPayload = {
					items: reorderedWorkspaces.map((w) => ({
						id: w.id,
						order: w.order,
					})),
				}

				console.log('Sending payload:', requestPayload)

				// 一時的に状態を更新
				setWorkspaces(
					defaultWorkspace
						? [defaultWorkspace, ...reorderedWorkspaces]
						: reorderedWorkspaces,
				)

				// reorderWorkspaces関数を使用してAPIを呼び出す
				await reorderWorkspaces(requestPayload)
			} catch (error) {
				console.error('Reorder error:', error)
				// エラー時は元の状態に戻す
				setWorkspaces(workspaces)
			}
		},
	})

	return (
		<div className="space-y-1">
			<GridList
				aria-label="Workspaces"
				items={nonDefaultWorkspaces}
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
