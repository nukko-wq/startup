'use client'

import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import SpaceRenameDialog from './SpaceRenameDialog'

interface HeaderMenuProps {
	spaceId: string
	spaceName: string
}

const HeaderMenu = ({ spaceId, spaceName }: HeaderMenuProps) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-2 hover:bg-zinc-200 transition-colors duration-200 rounded-full"
				>
					<EllipsisVertical className="w-6 h-6 text-zinc-700" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md min-w-[200px]">
						<MenuItem
							onAction={() => setIsOpen(true)}
							className="p-2 outline-none hover:bg-zinc-200 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<Pencil className="w-4 h-4" />
								Rename
							</div>
						</MenuItem>
						{/* TODO: 削除ダイアログを表示してスペースの削除をできるようにする */}
						<MenuItem
							//onAction={() => setIsDeleteDialogOpen(true)}
							className="p-2 outline-none hover:bg-zinc-200 text-red-600 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								Delete
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<SpaceRenameDialog
				spaceId={spaceId}
				initialName={spaceName}
				isOpen={isOpen}
				onOpenChange={setIsOpen}
			/>
		</>
	)
}

export default HeaderMenu
