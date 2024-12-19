import { useState } from 'react'
import { EllipsisVertical, FilePlus, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import SectionDeleteDialog from './SectionDeleteDialog'
import type { Section } from '@/app/lib/redux/features/section/types/section'

interface SectionMenuProps {
	section: Section
	onAddResourceClick: () => void
}

const SectionMenu = ({ section, onAddResourceClick }: SectionMenuProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-2 hover:bg-slate-200 transition-colors duration-200 rounded-full"
				>
					<EllipsisVertical className="w-6 h-6 text-slate-700" />
				</Button>
				<Popover>
					<Menu className="bg-slate-50 outline-none border rounded-lg shadow-md min-w-[200px] text-sm">
						<MenuItem
							id="add-resource"
							className="pl-3 pr-2 py-2 outline-none hover:bg-slate-100 cursor-pointer rounded-t-lg"
							onAction={onAddResourceClick}
						>
							<div className="flex items-center gap-2">
								<FilePlus className="w-4 h-4" />
								Add a resource
							</div>
						</MenuItem>
						<MenuItem
							id="delete-section"
							className="pl-3 pr-2 py-2 outline-none hover:bg-slate-100 text-red-600 cursor-pointer rounded-b-lg"
							onAction={() => setIsDeleteDialogOpen(true)}
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								Delete section
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<SectionDeleteDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				section={section}
			/>
		</>
	)
}

export default SectionMenu
