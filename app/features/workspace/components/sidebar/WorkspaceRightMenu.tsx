import WorkspaceDeleteDialog from '@/app/features/workspace/components/sidebar/WorkspaceDeleteDialog'
import WorkspaceRenameDialog from '@/app/features/workspace/components/sidebar/WorkspaceRenameDialog'
import type { Workspace } from '@/app/lib/redux/features/workspace/types/workspace'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'

const WorkspaceRightMenu = ({ workspace }: { workspace: Workspace }) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
	return (
		<>
			<MenuTrigger>
				<Button className="outline-hidden p-1 my-1 mr-2 group-hover:bg-gray-700 transition duration-200 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer">
					<EllipsisVertical className="w-5 h-5 text-slate-50" />
				</Button>
				<Popover>
					<Menu className="bg-slate-50 outline-hidden border rounded-xs shadow-md min-w-[160px]">
						<MenuItem
							className="pl-4 pr-4 py-2 outline-hidden hover:cursor-pointer hover:bg-slate-100"
							onAction={() => setIsRenameDialogOpen(true)}
						>
							<div className="flex items-center gap-3 text-sm">
								<Pencil className="w-4 h-4" />
								<span>Rename</span>
							</div>
						</MenuItem>
						<MenuItem
							onAction={() => setIsDeleteDialogOpen(true)}
							className="pl-4 pr-5 py-2 outline-hidden hover:bg-slate-100 text-red-600 hover:cursor-pointer text-sm"
						>
							<div className="flex items-center gap-3">
								<Trash2 className="w-4 h-4" />
								<span>Delete</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<WorkspaceRenameDialog
				workspace={workspace}
				isOpen={isRenameDialogOpen}
				onOpenChange={setIsRenameDialogOpen}
			/>

			<WorkspaceDeleteDialog
				workspace={workspace}
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			/>
		</>
	)
}

export default WorkspaceRightMenu
