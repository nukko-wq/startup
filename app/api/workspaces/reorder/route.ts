import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
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
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json(
				{ success: false, error: '認証が必要です' },
				{ status: 401 },
			)
		}

		const body = await req.json()
		const result = reorderSchema.safeParse(body)

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: '無効なリクエストデータです' },
				{ status: 400 },
			)
		}

		const { items } = result.data

		// トランザクションで一括更新（最適化版）
		const updatedWorkspaces = await db.$transaction(async (tx) => {
			// 一括で一時的な順序を更新
			await tx.workspace.updateMany({
				where: {
					id: { in: items.map((item) => item.id) },
					userId,
					isDefault: false,
				},
				data: {
					order: {
						increment: 10000, // 十分大きな値
					},
				},
			})

			// 目的の順序に一括更新
			await Promise.all(
				items.map((item) =>
					tx.workspace.update({
						where: {
							id: item.id,
							userId,
							isDefault: false,
						},
						data: { order: item.order },
					}),
				),
			)

			// 更新後のワークスペースを取得
			return tx.workspace.findMany({
				where: { userId },
				orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
			})
		})

		return NextResponse.json({
			success: true,
			data: updatedWorkspaces,
		})
	} catch (error) {
		console.error('Server error:', error)
		return NextResponse.json(
			{ success: false, error: 'サーバーエラーが発生しました' },
			{ status: 500 },
		)
	}
}
