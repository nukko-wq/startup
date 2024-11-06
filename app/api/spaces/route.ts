import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { spaceCreateSchema } from '@/lib/validations/space'
import { z } from 'zod'

export async function POST(req: NextRequest) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const json = await req.json()
		const body = spaceCreateSchema.parse(json)

		const workspace = await db.workspace.findFirst({
			where: {
				id: body.workspaceId,
				userId,
			},
		})

		if (!workspace) {
			return NextResponse.json(
				{ error: 'ワークスペースが見つかりません' },
				{ status: 404 },
			)
		}

		const maxOrderSpace = await db.space.findFirst({
			where: {
				userId,
				workspaceId: workspace.id,
			},
			orderBy: { order: 'desc' },
			select: { order: true },
		})

		const newOrder = maxOrderSpace ? maxOrderSpace.order + 1 : 1

		const space = await db.space.create({
			data: {
				name: body.name,
				order: newOrder,
				userId,
				workspaceId: workspace.id,
			},
		})

		return NextResponse.json(space)
	} catch (error) {
		console.error('Space creation error:', error)

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'バリデーションエラー', details: error.issues },
				{ status: 422 },
			)
		}

		return NextResponse.json(
			{ error: 'スペースの作成に失敗しました' },
			{ status: 500 },
		)
	}
}
