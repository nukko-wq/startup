import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import { useState } from 'react'
import WorkspaceDeleteDialog from '@/app/features/workspace/components/sidebar/WorkspaceDeleteDialog'
import type { Workspace } from '@/app/lib/redux/features/workspace/types/workspace'

const WorkspaceRightMenu = ({ workspace }: { workspace: Workspace }) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	return (
		<>
			<MenuTrigger>
				<Button className="outline-none p-1 mr-2 group-hover:bg-gray-700 transition duration-200 rounded-full opacity-0 group-hover:opacity-100">
					<EllipsisVertical className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-sm shadow-md min-w-[160px]">
						<MenuItem
							onAction={() => setIsDeleteDialogOpen(true)}
							className="pl-4 pr-5 py-2 outline-none hover:bg-zinc-100 text-red-600 hover:cursor-pointer text-sm"
						>
							<div className="flex items-center gap-3">
								<Trash2 className="w-4 h-4" />
								<span>Delete</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<WorkspaceDeleteDialog
				workspace={workspace}
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			/>
		</>
	)
}

export default WorkspaceRightMenu
