'use client'

import { EllipsisVertical, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import { useRouter } from 'next/navigation'
import type { Space } from '@/app/types/space'

interface DeleteSpaceButtonProps {
	spaceId: string
	setSpaces: React.Dispatch<React.SetStateAction<Space[]>>
}

const DeleteSpaceButton = ({ spaceId, setSpaces }: DeleteSpaceButtonProps) => {
	const router = useRouter()

	const handleDelete = async () => {
		try {
			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to delete space')
			}

			setSpaces((prevSpaces) =>
				prevSpaces.filter((space) => space.id !== spaceId),
			)

			// ルートパスに戻る
			router.push('/')
			router.refresh()
		} catch (error) {
			console.error('Error deleting space:', error)
			alert('スペースの削除に失敗しました')
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
						onAction={handleDelete}
						className="px-3 py-2 outline-none hover:bg-zinc-200 text-red-600 hover:cursor-pointer"
					>
						<div className="flex items-center gap-2">
							<Trash2 className="w-4 h-4" />
							Delete
						</div>
					</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	)
}

export default DeleteSpaceButton
