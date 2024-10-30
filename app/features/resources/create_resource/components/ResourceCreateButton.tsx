'use client'

import { useState } from 'react'
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components'
import { FilePlus } from 'lucide-react'
import ResourceCreateForm from '@/app/features/resources/create_resource/components/ResourceCreateForm'

const ResourceCreateButton = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false)

	return (
		<div className="mr-4">
			<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
				<Button
					aria-label="Menu"
					className="outline-none p-3 hover:bg-zinc-200 rounded-full"
				>
					<FilePlus className="w-6 h-6 text-zinc-700" />
				</Button>
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
