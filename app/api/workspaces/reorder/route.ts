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

		// リクエストボディの取得とバリデーション
		const json = await req.json()
		console.log('Received payload:', json)

		const validatedData = reorderSchema.safeParse(json)
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

		// データベース更新
		try {
			const updatedWorkspaces = await db.$transaction(async (tx) => {
				// 各ワークスペースの更新
				await Promise.all(
					items.map(({ id, order }) =>
						tx.workspace.update({
							where: {
								id,
								userId: user.id,
							},
							data: { order },
						}),
					),
				)

				// 更新後のワークスペースを取得
				return await tx.workspace.findMany({
					where: {
						userId: user.id,
					},
					orderBy: {
						order: 'asc',
					},
				})
			})

			return NextResponse.json({
				success: true,
				data: updatedWorkspaces,
			})
		} catch (dbError) {
			console.error('Database error:', dbError)
			return NextResponse.json(
				{ success: false, error: 'データベースの更新に失敗しました' },
				{ status: 500 },
			)
		}
	} catch (error) {
		console.error('Request error:', error)
		return NextResponse.json(
			{ success: false, error: 'サーバーエラーが発生しました' },
			{ status: 500 },
		)
	}
}
