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

interface ResourceCreateButtonProps {
	sectionId: string
	isOpen?: boolean
	onOpenChange?: (isOpen: boolean) => void
}

const ResourceCreateButton = ({
	sectionId,
	isOpen,
	onOpenChange,
}: ResourceCreateButtonProps) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false)

	return (
		<div>
			<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
				<TooltipTrigger
					isOpen={isTooltipVisible}
					onOpenChange={setIsTooltipVisible}
					delay={700}
					closeDelay={0}
				>
					<Button
						aria-label="Menu"
						className="outline-none hover:bg-zinc-200 transition-colors duration-200 rounded-full p-2"
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
								className="fill-zinc-800"
							>
								<path d="M0 0 L4 4 L8 0" />
							</svg>
						</OverlayArrow>
						Add Resource
					</Tooltip>
				</TooltipTrigger>
				<Popover placement="start" className="">
					<Dialog className="outline-none">
						<div className="bg-white flex items-center justify-center rounded-lg shadow-md">
							<ResourceCreateForm
								sectionId={sectionId}
								onClose={() => onOpenChange?.(false)}
							/>
						</div>
					</Dialog>
				</Popover>
			</DialogTrigger>
		</div>
	)
}

export default ResourceCreateButton
