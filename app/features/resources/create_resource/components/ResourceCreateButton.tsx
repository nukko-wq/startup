'use client'

import { useState } from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	OverlayArrow,
	Popover,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import { FilePlus } from 'lucide-react'
import ResourceCreateForm from '@/app/features/resources/create_resource/components/ResourceCreateForm'

const ResourceCreateButton = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false)

	return (
		<div className="mr-4">
			<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
				<TooltipTrigger
					isOpen={isTooltipVisible}
					onOpenChange={setIsTooltipVisible}
					delay={700}
					closeDelay={0}
				>
					<Button
						aria-label="Menu"
						className="outline-none p-3 hover:bg-zinc-200 rounded-full"
					>
						<FilePlus className="w-6 h-6 text-zinc-700" />
					</Button>
					<Tooltip className="bg-zinc-800 text-zinc-300 text-sm shadow-md rounded-lg px-2 py-1">
						<OverlayArrow>
							{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
							<svg
								width={8}
								height={8}
								viewBox="0 0 8 8"
								className="fill-white"
							>
								<path d="M0 0 L4 4 L8 0" />
							</svg>
						</OverlayArrow>
						Add Resource
					</Tooltip>
				</TooltipTrigger>
				<Popover placement="start">
					<Dialog className="outline-none">
						<div className="bg-white flex items-center justify-center rounded-lg shadow-md">
							<ResourceCreateForm onClose={() => setIsOpen(false)} />
						</div>
					</Dialog>
				</Popover>
			</DialogTrigger>
		</div>
	)
}

export default ResourceCreateButton
