'use server'

import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import type { ResourceSchema } from '@/lib/validations/resource'
import { revalidatePath } from 'next/cache'

export async function createResource(data: ResourceSchema) {
	const user = await getCurrentUser()

	if (!user) {
		throw new Error('Unauthorized')
	}
	const lastResource = await db.resource.findFirst({
		where: { userId: user.id },
		orderBy: { position: 'desc' },
		select: { position: true },
	})

	const newPosition = lastResource ? lastResource.position + 1 : 0

	const resource = await db.resource.create({
		data: {
			...data,
			title: data.title || '',
			description: data.description || '',
			faviconUrl: data.faviconUrl || null,
			position: newPosition,
			userId: user.id,
		},
	})

	revalidatePath('/resources')
	return resource
}
