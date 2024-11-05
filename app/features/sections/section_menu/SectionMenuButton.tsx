import { EllipsisVertical, FilePlus, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import DeleteSectionDialog from '@/app/features/sections/delete_section/DeleteSectionDialog'
import { useState } from 'react'

interface SectionMenuButtonProps {
	sectionId: string
	onDelete: (sectionId: string) => void
	onResourceCreate: () => void
}

const SectionMenuButton = ({
	sectionId,
	onDelete,
	onResourceCreate,
}: SectionMenuButtonProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
							onAction={onResourceCreate}
							className="p-2 outline-none hover:bg-zinc-200 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<FilePlus className="w-4 h-4" />
								Add a resource
							</div>
						</MenuItem>
						<MenuItem
							onAction={() => setIsDeleteDialogOpen(true)}
							className="p-2 outline-none hover:bg-zinc-200 text-red-600 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								Delete section
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<DeleteSectionDialog
				sectionId={sectionId}
				onDelete={onDelete}
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			/>
		</>
	)
}

export default SectionMenuButton
