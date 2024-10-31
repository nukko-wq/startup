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
		const {
			title,
			description = '',
			url,
			position,
			faviconUrl = '',
			mimeType,
			isGoogleDrive = false,
		} = body

		const resource = await db.resource.create({
			data: {
				title,
				description,
				url,
				faviconUrl,
				position,
				mimeType,
				isGoogleDrive,
				user: {
					connect: {
						id: userId,
					},
				},
			},
			select: {
				id: true,
				title: true,
				description: true,
				url: true,
				faviconUrl: true,
				position: true,
				mimeType: true,
				isGoogleDrive: true,
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
