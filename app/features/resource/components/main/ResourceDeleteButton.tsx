import { useAppDispatch } from '@/app/lib/redux/hooks'
import { removeResource } from '@/app/lib/redux/features/resource/resourceSlice'
import { deleteResource } from '@/app/lib/redux/features/resource/resourceAPI'
import { Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'

interface ResourceDeleteButtonProps {
	resourceId: string
}

const ResourceDeleteButton = ({ resourceId }: ResourceDeleteButtonProps) => {
	const dispatch = useAppDispatch()
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		try {
			setIsDeleting(true)
			await deleteResource(resourceId)
			dispatch(removeResource(resourceId))
		} catch (error) {
			console.error('リソースの削除に失敗しました:', error)
		} finally {
			setIsDeleting(false)
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
				className={`p-2 mr-1 transition-colors duration-200 rounded-full outline-none
					${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
				onPress={handleDelete}
				isDisabled={isDeleting}
			>
				<Trash2 className="w-5 h-5 text-zinc-700" />
			</Button>
			{isTooltipVisible && (
				<Tooltip className="bg-gray-800 text-gray-300 text-sm shadow-md rounded-lg px-2 py-1">
					<OverlayArrow>
						<svg
							width={8}
							height={8}
							viewBox="0 0 8 8"
							className="fill-gray-800"
							aria-labelledby="arrowTitle"
						>
							<title id="arrowTitle">ツールチップの矢印</title>
							<path d="M0 0 L4 4 L8 0" />
						</svg>
					</OverlayArrow>
					Remove Item
				</Tooltip>
			)}
		</TooltipTrigger>
	)
}

export default ResourceDeleteButton
