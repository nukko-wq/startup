import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const resourceCreateSchema = z.object({
	title: z.string(),
	description: z.string().optional().default('Webpage'),
	url: z.string(),
	faviconUrl: z.string().optional().default(''),
	position: z.number(),
	mimeType: z.string().optional(),
	isGoogleDrive: z.boolean().optional().default(false),
	sectionId: z.string(),
})

export async function POST(req: NextRequest) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			console.log('Unauthorized - No user ID in session:', session)
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const json = await req.json()
		const body = resourceCreateSchema.parse(json)

		const section = await db.section.findUnique({
			where: {
				id: body.sectionId,
				userId,
			},
			include: {
				resources: {
					orderBy: {
						position: 'asc',
					},
				},
			},
		})

		if (!section) {
			return NextResponse.json(
				{ error: 'セクションが見つかりません' },
				{ status: 404 },
			)
		}

		await db.resource.updateMany({
			where: {
				sectionId: body.sectionId,
				position: {
					gte: body.position,
				},
			},
			data: {
				position: {
					increment: 1,
				},
			},
		})

		const resource = await db.resource.create({
			data: {
				title: body.title,
				description: body.description,
				url: body.url,
				faviconUrl: body.faviconUrl,
				position: body.position,
				mimeType: body.mimeType,
				isGoogleDrive: body.isGoogleDrive,
				user: {
					connect: {
						id: userId,
					},
				},
				section: {
					connect: {
						id: body.sectionId,
					},
				},
			},
		})

		return NextResponse.json(resource)
	} catch (error) {
		console.error('Resource creation error:', error)

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'バリデーションエラー', details: error.issues },
				{ status: 422 },
			)
		}
		return NextResponse.json(
			{
				error: 'サーバーエラーが発生しました',
				message: error instanceof Error ? error.message : '不明なエラー',
			},
			{ status: 500 },
		)
	}
}
