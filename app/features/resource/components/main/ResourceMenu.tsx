'use client'

import { useState, useCallback, useRef } from 'react'
import { Pencil } from 'lucide-react'
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
import ResourceEditForm from '@/app/features/resource/components/main/ResourceEditForm'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'

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
					className="outline-none p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full"
				>
					<Pencil className="w-5 h-5 text-gray-700" />
				</Button>
				{isTooltipVisible && !isDialogOpen && (
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
						Edit
					</Tooltip>
				)}
			</TooltipTrigger>
			<ModalOverlay
				isDismissable
				className="fixed flex top-0 left-0 w-screen h-screen z-100 bg-black/20 items-center justify-center"
			>
				<Modal className="flex items-center justify-center outline-none">
					<Dialog className="outline-none">
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
