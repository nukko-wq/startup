import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { resourceSchema } from '@/lib/validations/resource'
import { z } from 'zod'

export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await auth()

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
		}

		if (!params.id) {
			return NextResponse.json(
				{ error: 'Resource ID is required' },
				{ status: 400 },
			)
		}

		const { user } = session
		const json = await req.json()
		const body = resourceSchema.parse(json)

		const resource = await db.resource.update({
			where: {
				id: params.id,
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

		return NextResponse.json(resource)
	} catch (error) {
		console.error('Resource update error:', error)
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 422 },
			)
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
