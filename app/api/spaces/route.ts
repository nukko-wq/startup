import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { spaceCreateSchema } from '@/lib/validations/space'
import { z } from 'zod'

// スキーマを拡張
const extendedSpaceCreateSchema = spaceCreateSchema.extend({
	withDefaultSection: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const json = await req.json()
		const body = extendedSpaceCreateSchema.parse(json)

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

		// トランザクションを使用してSpaceとSectionを同時に作成
		const result = await db.$transaction(async (tx) => {
			const space = await tx.space.create({
				data: {
					name: body.name,
					order: newOrder,
					userId,
					workspaceId: workspace.id,
				},
			})

			const section = await tx.section.create({
				data: {
					name: 'Resources',
					order: 0,
					spaceId: space.id,
					userId,
				},
			})

			return { space, section }
		})

		return NextResponse.json(result)
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
