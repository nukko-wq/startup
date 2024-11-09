'use client'

import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import { useState } from 'react'
import { useWorkspaceStore } from '@/app/store/workspaceStore'
import DeleteWorkspaceDialog from '@/app/features/workspaces/delete_workspace/DeleteWorkspaceDialog'
import WorkspaceRenameDialog from '@/app/features/workspaces/rename_workspace/WorkspaceRenameDialog'

interface WorkspaceButtonMenuProps {
	workspaceId: string
	workspaceName: string
}

const WorkspaceButtonMenu = ({
	workspaceId,
	workspaceName,
}: WorkspaceButtonMenuProps) => {
	const [isRenameOpen, setIsRenameOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const { setWorkspaces } = useWorkspaceStore()

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-1 mr-2 group-hover:bg-gray-700 transition duration-200 rounded-full opacity-0 group-hover:opacity-100"
				>
					<EllipsisVertical className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-sm shadow-md min-w-[160px]">
						<MenuItem
							onAction={() => setIsRenameOpen(true)}
							className="pl-4 pr-5 py-2 outline-none hover:bg-zinc-100 hover:cursor-pointer text-sm"
						>
							<div className="flex items-center gap-3">
								<Pencil className="w-4 h-4" />
								Rename
							</div>
						</MenuItem>
						<MenuItem
							onAction={() => setIsDeleteOpen(true)}
							className="pl-4 pr-5 py-2 outline-none hover:bg-zinc-100 text-red-600 hover:cursor-pointer text-sm"
						>
							<div className="flex items-center gap-3">
								<Trash2 className="w-4 h-4" />
								Delete
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<WorkspaceRenameDialog
				workspaceId={workspaceId}
				initialName={workspaceName}
				isOpen={isRenameOpen}
				onOpenChange={setIsRenameOpen}
			/>
			<DeleteWorkspaceDialog
				workspaceId={workspaceId}
				isOpen={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
			/>
		</>
	)
}

export default WorkspaceButtonMenu
