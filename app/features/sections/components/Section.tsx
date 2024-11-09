'use client'

import ResourceCreateButton from '@/app/features/resources/create_resource/components/ResourceCreateButton'
import ResourceItem from '@/app/features/resources/components/ResourceItem'
import { File } from 'lucide-react'
import { useRef, useState } from 'react'
import SectionMenuButton from '@/app/features/sections/section_menu/SectionMenuButton'
import SectionNameEdit from '@/app/features/sections/edit_section/components/SectionNameEdit'
import { Button } from 'react-aria-components'
import { useResourceStore } from '@/app/store/resourceStore'

interface SectionProps {
	id: string
	name: string
	onDelete: (sectionId: string) => void
}

export default function Section({ id, name, onDelete }: SectionProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [sectionName, setSectionName] = useState(name)
	const [isResourceCreateOpen, setIsResourceCreateOpen] = useState(false)
	const { resources } = useResourceStore()

	const sectionResources = resources
		.filter((resource) => resource.sectionId === id)
		.sort((a, b) => a.position - b.position)

	const handleNameEdit = (newName: string) => {
		setSectionName(newName)
	}

	return (
		<div
			ref={ref}
			className="min-w-[260px] max-w-[920px] w-full mx-auto p-5 outline-none"
		>
			<div className="flex justify-between items-center mb-2 cursor-grab">
				<div className="flex items-center ml-4">
					<Button
						slot="drag"
						aria-label="ドラッグハンドル"
						className="cursor-grab"
					>
						<File className="w-6 h-6 text-zinc-700" />
					</Button>
					<SectionNameEdit
						initialName={sectionName}
						sectionId={id}
						onEdit={handleNameEdit}
					/>
				</div>
				<div className="flex">
					<ResourceCreateButton
						sectionId={id}
						isOpen={isResourceCreateOpen}
						onOpenChange={setIsResourceCreateOpen}
					/>
					<SectionMenuButton
						sectionId={id}
						onDelete={onDelete}
						onResourceCreate={() => setIsResourceCreateOpen(true)}
					/>
				</div>
			</div>
			<ResourceItem resources={sectionResources} sectionId={id} />
		</div>
	)
}
