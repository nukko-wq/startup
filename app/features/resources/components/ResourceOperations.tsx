import type { Resource } from '@prisma/client'

interface ResourceOperationsProps {
	resource: Pick<Resource, 'id' | 'title'>
}

const ResourceOperations = ({ resource }: ResourceOperationsProps) => {
	return (
		<>
			<div>PostOperations</div>
		</>
	)
}

export default ResourceOperations
