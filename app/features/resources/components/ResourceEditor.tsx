import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import type { Resource, User } from '@prisma/client'
import { redirect } from 'next/navigation'
import ResourceEditorClient from '@/app/features/resources/components/ResourceEditorClient'

async function getResource(resourceId: Resource['id'], userId: User['id']) {
	const resource = await db.resource.findFirst({
		where: {
			id: resourceId,
			userId,
		},
	})
	return resource
}

export default async function ResourceEditor({
	resourceId,
}: {
	resourceId: Resource['id']
}) {
	const user = await getCurrentUser()
	if (!user) {
		redirect('/login')
	}
	const userId = user.id
	const resource = await getResource(resourceId, userId)
	console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ resource:', resource)

	if (!resource) {
		return null
	}

	return <ResourceEditorClient resource={resource} />
}
