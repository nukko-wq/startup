import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import SpaceDeleteDialog from '@/app/features/space/components/sidebar/SpaceDeleteDialog'
import { useState } from 'react'
import SpaceRenameDialog from '@/app/features/space/components/sidebar/SpaceRenameDialog'

const SpaceMenu = ({ spaceId }: { spaceId: string }) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-1 mr-2 group-hover:bg-gray-600 transition-colors duration-200 rounded-full"
				>
					<EllipsisVertical className="w-5 h-5 text-zinc-700 opacity-0 group-hover:opacity-100 group-hover:text-zinc-200 transition duration-300" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md min-w-[160px] text-sm">
						<MenuItem
							onAction={() => setIsRenameDialogOpen(true)}
							className="pl-3 pr-4 py-2 outline-none hover:bg-zinc-100 hover:cursor-pointer rounded-t-lg"
						>
							<div className="flex items-center gap-2">
								<Pencil className="w-4 h-4" />
								Rename
							</div>
						</MenuItem>
						<MenuItem
							onAction={() => setIsDeleteDialogOpen(true)}
							className="pl-3 pr-4 py-2 outline-none hover:bg-zinc-100 text-red-600 hover:cursor-pointer rounded-b-lg"
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								Delete
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<SpaceRenameDialog />

			<SpaceDeleteDialog
				spaceId={spaceId}
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			/>
		</>
	)
}

export default SpaceMenu
