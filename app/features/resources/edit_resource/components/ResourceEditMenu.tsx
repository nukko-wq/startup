'use client'

import {
	Button,
	DialogTrigger,
	Dialog,
	Modal,
	ModalOverlay,
	Tooltip,
	TooltipTrigger,
	OverlayArrow,
} from 'react-aria-components'
import ResourceEditForm from '@/app/features/resources/edit_resource/components/ResourceEditForm'
import type { Resource } from '@prisma/client'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
const ResourceEditMenu = ({
	resource,
}: { resource: Pick<Resource, 'id' | 'title' | 'description' | 'url'> }) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)

	return (
		<DialogTrigger>
			<TooltipTrigger
				isOpen={isTooltipVisible}
				onOpenChange={setIsTooltipVisible}
				delay={700}
				closeDelay={0}
			>
				<Button
					aria-label="Edit"
					className="outline-none p-2 hover:bg-zinc-200 rounded-full"
				>
					<Pencil className="w-5 h-5 text-zinc-700" />
				</Button>
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
					Edit
				</Tooltip>
			</TooltipTrigger>
			<ModalOverlay
				isDismissable
				className="fixed flex top-0 left-0 w-screen h-screen z-100 bg-black/20 items-center justify-center"
			>
				<Modal className="flex items-center justify-center outline-none">
					<Dialog className="outline-none">
						{({ close }) => (
							<div className="bg-white flex items-center justify-center rounded-lg shadow-md w-[700px]">
								<ResourceEditForm resource={resource} onClose={close} />
							</div>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default ResourceEditMenu
