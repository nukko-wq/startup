import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { z } from 'zod'

// バリデーションスキーマの定義
const reorderSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			order: z.number().int().positive(),
		}),
	),
})

export async function PUT(req: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json(
				{ success: false, error: '認証が必要です' },
				{ status: 401 },
			)
		}

		const body = await req.json()

		if (!body || !body.items || !Array.isArray(body.items)) {
			return NextResponse.json(
				{ success: false, error: '無効なリクエストデータです' },
				{ status: 400 },
			)
		}

		const validatedData = reorderSchema.safeParse(body)
		if (!validatedData.success) {
			return NextResponse.json(
				{
					success: false,
					error: '無効なリクエストデータです',
					details: validatedData.error.format(),
				},
				{ status: 400 },
			)
		}

		const { items } = validatedData.data

		const updatedWorkspaces = await db.$transaction(async (tx) => {
			// 更新対象のワークスペースを取得
			const targetWorkspaces = await tx.workspace.findMany({
				where: {
					id: { in: items.map((item) => item.id) },
					userId: user.id,
					isDefault: false,
				},
			})

			// 各ワークスペースの更新
			await Promise.all(
				items.map(({ id, order }) =>
					tx.workspace.update({
						where: { id, userId: user.id, isDefault: false },
						data: { order },
					}),
				),
			)

			// 更新後のすべてのワークスペースを取得
			return await tx.workspace.findMany({
				where: { userId: user.id },
				orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
			})
		})

		return NextResponse.json({ success: true, data: updatedWorkspaces })
	} catch (error) {
		console.error('Server error:', error)
		return NextResponse.json(
			{ success: false, error: 'サーバーエラーが発生しました' },
			{ status: 500 },
		)
	}
}
