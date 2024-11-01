'use client'

import ResourceCreateButton from '@/app/features/resources/create_resource/components/ResourceCreateButton'
import ResourceItem from '@/app/features/resources/components/ResourceItem'
import { File } from 'lucide-react'
import type { Resource } from '@prisma/client'
import { useResources } from '@/app/features/resources/contexts/ResourceContext'

interface SectionProps {
	id: string
	name: string
	resources: Resource[]
}

export default function Section({ id, name, resources }: SectionProps) {
	const { resources: contextResources } = useResources()

	// このセクションに属するリソースのみをフィルタリングし、postionでソート
	const sectionResources = contextResources
		.filter((resource) => resource.sectionId === id)
		.sort((a, b) => a.position - b.position)

	return (
		<div className="min-w-[260px] max-w-[920px] w-full p-5">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center gap-2 ml-4">
					<File className="w-6 h-6 text-zinc-700" />
					<div className="text-xl font-semibold text-zinc-700">{name}</div>
				</div>
				<div className="">
					<ResourceCreateButton sectionId={id} />
				</div>
			</div>
			<div className="flex flex-col border rounded-md">
				{resources.map((resource) => (
					<ResourceItem key={resource.id} resource={resource} />
				))}
			</div>
		</div>
	)
}
