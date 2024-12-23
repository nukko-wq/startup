'use client'

import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import {
	selectDefaultWorkspace,
	selectNonDefaultWorkspaces,
} from '@/app/lib/redux/features/workspace/selector'
import { ChevronRight, Layers } from 'lucide-react'
import WorkspaceLeftMenu from './WorkspaceLeftMenu'
import DefaultWorkspaceRightMenu from './DefaultWorkspaceRightMenu'
import WorkspaceRightMenu from './WorkspaceRightMenu'
import SpaceList from '@/app/features/space/components/sidebar/SpaceList'

const WorkspaceList = () => {
	const dispatch = useAppDispatch()
	const defaultWorkspace = useAppSelector(selectDefaultWorkspace)
	const nonDefaultWorkspaces = useAppSelector(selectNonDefaultWorkspaces)

	const onDragEnd = (result: DropResult) => {
		if (!result.destination) return
		// SpaceListコンポーネントに処理を委譲
	}

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
					{defaultWorkspace && <SpaceList workspaceId={defaultWorkspace.id} />}
				</div>

				{/* 通常のワークスペース */}
				{nonDefaultWorkspaces.map((workspace) => (
					<div key={workspace.id}>
						<div className="flex items-center">
							<div className="flex flex-col flex-grow justify-between">
								<div className="flex items-center justify-between group min-h-[40px] mt-1">
									<div className="flex items-center flex-grow">
										<div className="flex items-center cursor-grab">
											<div className="rounded-full py-1 pl-1 pr-2 ml-2">
												<ChevronRight className="w-6 h-6 text-gray-600" />
											</div>
										</div>
										<div className="flex items-center flex-grow justify-between hover:border-b-2 hover:border-blue-500 pb-1">
											<span className="font-medium text-gray-500">
												{workspace.name}
											</span>
											<div className="flex items-center">
												<WorkspaceLeftMenu workspaceId={workspace.id} />
												<WorkspaceRightMenu workspace={workspace} />
											</div>
										</div>
									</div>
								</div>
								<SpaceList workspaceId={workspace.id} />
							</div>
						</div>
					</div>
				))}
			</div>
		</DragDropContext>
	)
}

export default WorkspaceList
