import { EllipsisVertical, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'

interface SectionMenuButtonProps {
	sectionId: string
	onDelete: (sectionId: string) => void
}

const SectionMenuButton = ({ sectionId, onDelete }: SectionMenuButtonProps) => {
	const handleDelete = async () => {
		if (!confirm('このセクションを削除してもよろしいですか？')) return

		try {
			const response = await fetch(`/api/sections/${sectionId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to delete section')
			}

			const result = await response.json()
			if (result.success) {
				onDelete(sectionId)
			} else {
				throw new Error(result.message)
			}
		} catch (error) {
			console.error('Section delete error:', error)
			alert('セクションの削除に失敗しました。')
		}
	}

	return (
		<MenuTrigger>
			<Button
				aria-label="Menu"
				className="outline-none p-2 hover:bg-zinc-200 rounded-full"
			>
				<EllipsisVertical className="w-6 h-6 text-zinc-700" />
			</Button>
			<Popover>
				<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md">
					<MenuItem
						onAction={() => alert('add a resource')}
						className="p-2 outline-none hover:bg-zinc-200 hover:cursor-pointer"
					>
						Add a resource
					</MenuItem>
					<MenuItem
						onAction={() => alert('select')}
						className="p-2 outline-none hover:bg-zinc-200 hover:cursor-pointer"
					>
						Select
					</MenuItem>
					<MenuItem
						onAction={() => alert('rename section')}
						className="p-2 outline-none hover:bg-zinc-200 hover:cursor-pointer"
					>
						Rename section
					</MenuItem>
					<MenuItem
						onAction={() => alert('add description')}
						className="p-2 outline-none hover:bg-zinc-200 hover:cursor-pointer"
					>
						Add a description
					</MenuItem>
					<MenuItem
						onAction={handleDelete}
						className="p-2 outline-none hover:bg-zinc-200 text-red-600 hover:cursor-pointer"
					>
						<div className="flex items-center gap-2">
							<Trash2 className="w-4 h-4" />
							Delete section
						</div>
					</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	)
}

export default SectionMenuButton
