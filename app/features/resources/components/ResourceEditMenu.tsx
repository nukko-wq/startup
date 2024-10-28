'use client'

import {
	Button,
	DialogTrigger,
	Dialog,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import ResourceEditForm from '@/app/features/resources/components/ResourceEditForm'
import type { Resource } from '@prisma/client'
import { Pencil } from 'lucide-react'
const ResourceEditMenu = ({
	resource,
}: { resource: Pick<Resource, 'id' | 'title' | 'description' | 'url'> }) => {
	return (
		<DialogTrigger>
			<Button aria-label="Edit" className="outline-none pl-4 pr-2 py-4">
				<Pencil className="w-5 h-5" />
			</Button>
			<ModalOverlay className="fixed inset-0 z-50 bg-black/20 items-center justify-center">
				<Modal className="fixed inset-0 flex items-center justify-center outline-none">
					<Dialog className="outline-none">
						{({ close }) => (
							<div className="bg-white flex items-center justify-center rounded-lg shadow-md">
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
