'use client'

import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Space } from '@/app/types/space'
import SpaceRenameDialog from '@/app/features/header/header_menu/SpaceRenameDialog'
import DeleteSpaceDialog from '@/app/features/spaces/delete_space/DeleteSpaceDialog'

interface SpaceButtonMenuProps {
	spaceId: string
	spaceName: string
	setSpaces: React.Dispatch<React.SetStateAction<Space[]>>
}

const SpaceButtonMenu = ({
	spaceId,
	spaceName,
	setSpaces,
}: SpaceButtonMenuProps) => {
	const router = useRouter()
	const [isRenameOpen, setIsRenameOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-2 mx-1 hover:bg-gray-600 transition-colors duration-200 rounded-full group"
				>
					<EllipsisVertical className="w-5 h-5 text-zinc-700 opacity-0 group-hover:opacity-100 group-hover:text-zinc-200 transition-opacity duration-300" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md">
						<MenuItem
							onAction={() => setIsRenameOpen(true)}
							className="pl-3 pr-4 py-2 outline-none hover:bg-zinc-100 hover:cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<Pencil className="w-4 h-4" />
								Rename
							</div>
						</MenuItem>
						<MenuItem
							onAction={() => setIsDeleteOpen(true)}
							className="pl-3 pr-4 py-2 outline-none hover:bg-zinc-100 text-red-600 hover:cursor-pointer"
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
				isOpen={isRenameOpen}
				onOpenChange={setIsRenameOpen}
			/>
			<DeleteSpaceDialog
				spaceId={spaceId}
				setSpaces={setSpaces}
				isOpen={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
			/>
		</>
	)
}

export default SpaceButtonMenu
