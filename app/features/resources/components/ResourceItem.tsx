'use client'

import type { Resource } from '@prisma/client'
import ResourceEditMenu from '@/app/features/resources/edit_resource/components/ResourceEditMenu'
import ResourceDeleteButton from '@/app/features/resources/delete_resource/components/ResourceDeleteButton'
import { Link } from 'react-aria-components'
import { Earth } from 'lucide-react'

interface ResourceItemProps {
	resource: Pick<
		Resource,
		'id' | 'title' | 'description' | 'url' | 'faviconUrl'
	>
}

export default function ResourceItem({ resource }: ResourceItemProps) {
	return (
		<div className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-zinc-100">
			<div className="flex flex-grow flex-col p-1 ml-1">
				<Link href={resource.url} target="_blank" className="outline-none">
					<div className="flex items-center gap-2">
						{resource.faviconUrl ? (
							<div className="border border-gray-200 rounded-sm p-2">
								<img
									src={resource.faviconUrl}
									alt="Favicon"
									className="w-4 h-4"
								/>
							</div>
						) : (
							<div className="border border-gray-200 rounded-sm p-2">
								<Earth className="w-4 h-4" />
							</div>
						)}
						<div className="flex flex-col">
							<div>{resource.title}</div>
							<div className="text-xs text-muted-foreground">
								{resource.description || 'Webpage'}
							</div>
						</div>
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
