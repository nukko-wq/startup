'use client'

import type { Resource } from '@prisma/client'

interface ResourceEditorClientProps {
	resource: Resource
}

export default function ResourceEditorClient({
	resource,
}: ResourceEditorClientProps) {
	return (
		<div>
			<h2>Resource Editor</h2>
			<div>{resource.title}</div>
			<div>{resource.url}</div>
			<div>{resource.description}</div>
		</div>
	)
}
