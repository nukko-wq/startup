import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const sectionCreateSchema = z.object({
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
		const body = sectionCreateSchema.parse(json)

		const section = await db.section.create({
			data: {
				name: body.name,
				order: body.order,
				user: {
					connect: {
						id: userId,
					},
				},
			},
		})

		return NextResponse.json(section)
	} catch (error) {
		console.error('Section creation error:', error)

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

export async function PUT(req: NextRequest) {
	// セクション更新API（名前変更、順序変更など）
}
