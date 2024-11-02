'use client'

import ResourceCreateButton from '@/app/features/resources/create_resource/components/ResourceCreateButton'
import ResourceItem from '@/app/features/resources/components/ResourceItem'
import { File } from 'lucide-react'
import { useResources } from '@/app/features/resources/contexts/ResourceContext'
import { useRef } from 'react'

interface SectionProps {
	id: string
	name: string
}

export default function Section({ id, name }: SectionProps) {
	const { resources } = useResources()
	const ref = useRef<HTMLDivElement>(null)

	const sectionResources = resources
		.filter((resource) => resource.sectionId === id)
		.sort((a, b) => a.position - b.position)

	return (
		<div ref={ref} className="min-w-[260px] max-w-[920px] w-full p-5">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center gap-2 ml-4">
					<File className="w-6 h-6 text-zinc-700" />
					<div className="text-xl font-semibold text-zinc-700">{name}</div>
				</div>
				<div className="">
					<ResourceCreateButton sectionId={id} />
				</div>
			</div>
			<ResourceItem resources={sectionResources} sectionId={id} />
		</div>
	)
}
