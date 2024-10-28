'use client'

import type { Resource } from '@prisma/client'
import ResourceEditMenu from '@/app/features/resources/edit_resource/components/ResourceEditMenu'
import ResourceDeleteButton from '@/app/features/resources/delete_resource/components/ResourceDeleteButton'
import { Link } from 'react-aria-components'

interface ResourceItemProps {
	resource: Pick<Resource, 'id' | 'title' | 'description' | 'url'>
}

export default function ResourceItem({ resource }: ResourceItemProps) {
	return (
		<div className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-zinc-100">
			<div className="flex flex-grow flex-col p-1 ml-1">
				<Link href={resource.url} target="_blank" className="outline-none">
					<div>{resource.title}</div>
					<div className="text-sm text-muted-foreground">
						{resource.description}
					</div>
				</Link>
			</div>
			<div className="flex items-center">
				<ResourceEditMenu resource={resource} />
				<ResourceDeleteButton resource={resource} />
			</div>
		</div>
	)
}
