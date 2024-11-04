import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const spaceCreateSchema = z.object({
	name: z.string(),
	order: z.number(),
})

export async function POST(req: NextRequest) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const json = await req.json()
		const body = spaceCreateSchema.parse(json)

		const space = await db.space.create({
			data: {
				name: body.name,
				order: body.order,
				userId,
			},
		})

		return NextResponse.json(space)
	} catch (error) {
		console.error('Space creation error:', error)
		return NextResponse.json(
			{ error: 'スペースの作成に失敗しました' },
			{ status: 500 },
		)
	}
}
