import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { resourceSchema } from '@/lib/validations/resource'
import { z } from 'zod'

export async function PATCH(request: NextRequest) {
	try {
		const session = await auth()

		if (!session) {
			return Response.json({ error: 'Unauthorized' }, { status: 403 })
		}

		const url = new URL(request.url)
		const id = url.pathname.split('/').pop()

		if (!id) {
			return Response.json(
				{ error: 'Resource ID is required' },
				{ status: 400 },
			)
		}

		const { user } = session
		const json = await request.json()
		const body = resourceSchema.parse(json)

		const resource = await db.resource.update({
			where: {
				id,
				userId: user.id,
			},
			data: {
				title: body.title,
				description: body.description,
				url: body.url,
			},
			select: {
				id: true,
				title: true,
				description: true,
				url: true,
			},
		})

		return Response.json(resource)
	} catch (error) {
		console.error('Resource update error:', error)
		if (error instanceof z.ZodError) {
			return Response.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 422 },
			)
		}
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
