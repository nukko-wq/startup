'use client'

import {
	Button,
	DialogTrigger,
	Popover,
	Dialog,
	Modal,
} from 'react-aria-components'
import ResourceEditForm from '@/app/features/resources/components/ResourceEditForm'
import type { Resource } from '@prisma/client'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
const ResourceEditMenu = ({
	resource,
}: { resource: Pick<Resource, 'id' | 'title' | 'description' | 'url'> }) => {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			<Button aria-label="Menu" className="outline-none pl-4 pr-2 py-4">
				<Pencil className="w-5 h-5" />
			</Button>
			<Popover className="">
				<Dialog className="outline-none">
					<div>
						<div className="bg-white flex items-center justify-center rounded-lg shadow-md">
							<ResourceEditForm
								resource={resource}
								onClose={() => setIsOpen(false)}
							/>
						</div>
					</div>
				</Dialog>
			</Popover>
		</DialogTrigger>
	)
}

export default ResourceEditMenu
