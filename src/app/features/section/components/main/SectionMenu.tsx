import type { Section } from '@/app/lib/redux/features/section/types/section'
import { EllipsisVertical, FilePlus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import SectionDeleteDialog from './SectionDeleteDialog'

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
					className="outline-hidden p-2 hover:bg-slate-200 transition-colors duration-200 rounded-full cursor-pointer"
				>
					<EllipsisVertical className="w-6 h-6 text-slate-700" />
				</Button>
				<Popover>
					<Menu className="bg-slate-50 outline-hidden border rounded-lg shadow-md min-w-[200px] text-sm">
						<MenuItem
							id="add-resource"
							className="pl-3 pr-2 py-2 outline-hidden hover:bg-slate-100 cursor-pointer rounded-t-lg"
							onAction={onAddResourceClick}
						>
							<div className="flex items-center gap-2">
								<FilePlus className="w-4 h-4" />
								リソースを追加
							</div>
						</MenuItem>
						<MenuItem
							id="delete-section"
							className="pl-3 pr-2 py-2 outline-hidden hover:bg-slate-100 text-red-600 cursor-pointer rounded-b-lg"
							onAction={() => setIsDeleteDialogOpen(true)}
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								セクションの削除
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
