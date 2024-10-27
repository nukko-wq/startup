import type { Resource } from '@prisma/client'
import ResourceEditMenu from '@/app/features/resources/components/ResourceEditMenu'
import Link from 'next/link'

interface ResourceItemProps {
	resource: Pick<Resource, 'id' | 'title' | 'description' | 'url'>
}

export default function ResourceItem({ resource }: ResourceItemProps) {
	return (
		<div className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-zinc-100">
			<div className="flex flex-grow flex-col p-1 ml-1">
				<Link href={resource.url} target="_blank" className="">
					<div>{resource.title}</div>
					<div className="text-sm text-muted-foreground">
						{resource.description}
					</div>
				</Link>
			</div>
			<div>
				<ResourceEditMenu resource={resource} />
			</div>
		</div>
	)
}
