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
import { useResources } from '@/app/features/resources/contexts/ResourceContext'

const ResourceDeleteButton = ({
	resource,
}: { resource: Pick<Resource, 'id'> }) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)
	const { removeResource } = useResources()

	const handleDelete = async () => {
		try {
			const response = await fetch(`/api/resources/${resource.id}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to delete resource')
			}

			removeResource(resource.id)
		} catch (error) {
			console.error('Resource delete error:', error)
			alert('リソースの削除に失敗しました。')
		}
	}
	return (
		<TooltipTrigger
			isOpen={isTooltipVisible}
			onOpenChange={setIsTooltipVisible}
			delay={0}
			closeDelay={0}
		>
			<Button
				onPress={handleDelete}
				className="p-3 hover:bg-zinc-200 rounded-full"
			>
				<Trash2 className="w-5 h-5" />
			</Button>
			{isTooltipVisible && (
				<Tooltip className="bg-white text-sm shadow-md rounded-lg px-2 py-1">
					<OverlayArrow>
						{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
						<svg width={8} height={8} viewBox="0 0 8 8" className="fill-white">
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
