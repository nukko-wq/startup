'use client'

import { useState } from 'react'
import type { Resource } from '@prisma/client'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import { Trash2 } from 'lucide-react'
import { useResourceStore } from '@/app/store/resourceStore'

const ResourceDeleteButton = ({
	resource,
}: { resource: Pick<Resource, 'id'> }) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)
	const removeResource = useResourceStore((state) => state.removeResource)

	const handleDelete = async () => {
		try {
			await removeResource(resource.id)
		} catch (error) {
			console.error('Resource delete error:', error)
			alert('リソースの削除に失敗しました。')
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
				className="p-2 mr-1 hover:bg-gray-200 transition-colors duration-200 rounded-full outline-none"
			>
				<Trash2 className="w-5 h-5 text-zinc-700" />
			</Button>
			{isTooltipVisible && (
				<Tooltip className="bg-gray-800 text-gray-300 text-sm shadow-md rounded-lg px-2 py-1">
					<OverlayArrow>
						{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
						<svg
							width={8}
							height={8}
							viewBox="0 0 8 8"
							className="fill-gray-800"
						>
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
