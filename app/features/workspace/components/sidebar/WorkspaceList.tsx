'use client'

import { useSelector } from 'react-redux'
import {
	selectDefaultWorkspace,
	selectNonDefaultWorkspaces,
} from '@/app/lib/redux/features/workspace/selector'
import { ChevronRight, Layers } from 'lucide-react'
import { Button } from 'react-aria-components'
import WorkspaceLeftMenu from '@/app/features/workspace/components/sidebar/WorkspaceLeftMenu'

const WorkspaceList = () => {
	const defaultWorkspace = useSelector(selectDefaultWorkspace)
	const nonDefaultWorkspaces = useSelector(selectNonDefaultWorkspaces)

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
							<div className="">デフォルトワークスペース右メニュー</div>
						</div>
					</div>
				</div>
				{/* <SpaceList workspaceId={defaultWorkspace?.id} /> */}
			</div>

			{/* 通常のワークスペース */}
			<div className="flex flex-col">
				{nonDefaultWorkspaces.map((workspace) => (
					<div key={workspace.id} className="outline-none">
						<div className="flex items-center">
							<div className="flex flex-col flex-grow justify-between">
								<div className="flex items-center justify-between group min-h-[40px] mt-1">
									<div className="flex items-center flex-grow">
										<div className="flex items-center cursor-grab">
											<Button className="rounded-full py-1 pl-1 pr-2 ml-2">
												<ChevronRight className="w-6 h-6 text-gray-500" />
											</Button>
										</div>
										<div className="flex items-center flex-grow justify-between hover:border-b-2 hover:border-blue-500 pb-1">
											<span className="font-medium text-gray-500">
												{workspace.name}
											</span>
											<div className="flex items-center">
												<WorkspaceLeftMenu />
												<div>ワークスペースメニュー2</div>
											</div>
										</div>
									</div>
								</div>
								{/* <SpaceList workspaceId={workspace.id} /> */}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default WorkspaceList
