import { forwardRef, useCallback, useRef, useState } from 'react'
import { FilePlus } from 'lucide-react'
import {
	Button,
	Dialog,
	DialogTrigger,
	OverlayArrow,
	Popover,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import ResourceCreateForm from '@/app/features/resource/components/main/ResourceCreateForm'
import type { Section } from '@/app/lib/redux/features/section/types/section'

interface ResourceCreateButtonProps {
	section: Section
}

const ResourceCreateButton = forwardRef<
	HTMLButtonElement,
	ResourceCreateButtonProps
>(({ section }, ref) => {
	const [isOpen, setIsOpen] = useState(false)
	const isSubmitting = useRef(false)

	const handleFormClose = useCallback((isSubmit = false) => {
		if (isSubmit) {
			isSubmitting.current = true
			setIsOpen(false)
			setTimeout(() => {
				isSubmitting.current = false
			}, 100)
		} else {
			setIsOpen(false)
		}
	}, [])

	return (
		<div>
			<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
				<TooltipTrigger delay={700} closeDelay={0}>
					<Button
						ref={ref}
						aria-label="Add Resource"
						className="outline-none hover:bg-slate-200 transition-colors duration-200 rounded-full p-2"
					>
						<FilePlus className="w-6 h-6 text-slate-700" />
					</Button>
					<Tooltip className="bg-slate-800 text-slate-300 text-sm shadow-md rounded-lg px-2 py-1">
						<OverlayArrow>
							<svg
								width={8}
								height={8}
								viewBox="0 0 8 8"
								className="fill-slate-800"
								aria-labelledby="arrowTitle"
							>
								<title id="arrowTitle">ツールチップの矢印</title>
								<path d="M0 0 L4 4 L8 0" />
							</svg>
						</OverlayArrow>
						Add Resource
					</Tooltip>
				</TooltipTrigger>
				<Popover placement="start">
					<Dialog className="outline-none">
						<div className="bg-white flex items-center justify-center rounded-lg shadow-md">
							<ResourceCreateForm
								sectionId={section.id}
								onClose={handleFormClose}
							/>
						</div>
					</Dialog>
				</Popover>
			</DialogTrigger>
		</div>
	)
})

ResourceCreateButton.displayName = 'ResourceCreateButton'

export default ResourceCreateButton
