'use client'

import ResourceEditForm from '@/app/features/resource/components/main/ResourceEditForm'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import { Pencil } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'

const ResourceMenu = ({ resource }: { resource: Resource }) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const isSubmitting = useRef(false)

	const handleTooltipChange = useCallback(
		(isOpen: boolean) => {
			if (!isDialogOpen && !isSubmitting.current) {
				setIsTooltipVisible(isOpen)
			}
		},
		[isDialogOpen],
	)

	const handleDialogChange = useCallback((isOpen: boolean) => {
		setIsDialogOpen(isOpen)
		if (isOpen) {
			setIsTooltipVisible(false)
		}
	}, [])

	const handleFormClose = useCallback((isSubmit = false) => {
		if (isSubmit) {
			isSubmitting.current = true
			setIsTooltipVisible(false)
			setIsDialogOpen(false)
			setTimeout(() => {
				isSubmitting.current = false
			}, 100)
		} else {
			setIsTooltipVisible(false)
			setIsDialogOpen(false)
		}
	}, [])

	return (
		<DialogTrigger isOpen={isDialogOpen} onOpenChange={handleDialogChange}>
			<TooltipTrigger
				isOpen={isTooltipVisible && !isDialogOpen}
				onOpenChange={handleTooltipChange}
				delay={700}
				closeDelay={0}
			>
				<Button
					aria-label="Edit"
					className="outline-hidden p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full group/edit cursor-pointer"
				>
					<Pencil className="w-5 h-5 text-gray-500 group-hover/edit:text-gray-700" />
				</Button>
				{isTooltipVisible && !isDialogOpen && (
					<Tooltip className="bg-gray-800 text-gray-300 text-xs shadow-md rounded-lg px-2 py-1">
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
						編集
					</Tooltip>
				)}
			</TooltipTrigger>
			<ModalOverlay
				isDismissable
				className="fixed flex top-0 left-0 w-screen h-screen z-100 bg-black/20 items-center justify-center"
			>
				<Modal className="flex items-center justify-center outline-hidden">
					<Dialog className="outline-hidden">
						<div className="bg-white flex items-center justify-center rounded-lg shadow-md w-[700px]">
							<ResourceEditForm resource={resource} onClose={handleFormClose} />
						</div>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default ResourceMenu
