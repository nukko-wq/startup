'use client'

import {
	Button,
	DialogTrigger,
	Dialog,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import ResourceEditForm from '@/app/features/resources/edit_resource/components/ResourceEditForm'
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
