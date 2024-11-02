'use client'

import { useState } from 'react'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import { Trash2 } from 'lucide-react'

interface SectionDeleteButtonProps {
	sectionId: string
	onDelete: (sectionId: string) => void
}

const SectionDeleteButton = ({
	sectionId,
	onDelete,
}: SectionDeleteButtonProps) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)

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
		<TooltipTrigger
			isOpen={isTooltipVisible}
			onOpenChange={setIsTooltipVisible}
			delay={700}
			closeDelay={0}
		>
			<Button
				onPress={handleDelete}
				className="p-3 hover:bg-zinc-200 rounded-full outline-none"
			>
				<Trash2 className="w-5 h-5 text-zinc-700" />
			</Button>
			{isTooltipVisible && (
				<Tooltip className="bg-zinc-800 text-zinc-300 text-sm shadow-md rounded-lg px-2 py-1">
					<OverlayArrow>
						{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
						<svg
							width={8}
							height={8}
							viewBox="0 0 8 8"
							className="fill-zinc-800"
						>
							<path d="M0 0 L4 4 L8 0" />
						</svg>
					</OverlayArrow>
					Delete Section
				</Tooltip>
			)}
		</TooltipTrigger>
	)
}

export default SectionDeleteButton
