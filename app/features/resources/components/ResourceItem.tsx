import type { Resource } from '@prisma/client'

interface ResourceItemProps {
	resource: Pick<Resource, 'id' | 'title' | 'description'>
}

export default function ResourceItem({ resource }: ResourceItemProps) {
	return (
		<div className="flex flex-col gap-px">
			<div>{resource.title}</div>
			<div>{resource.description}</div>
		</div>
	)
}
