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

		// トランザクションで一括更新
		await db.$transaction(async (tx) => {
			// 各ワークスペースを個別に一時的な値に更新（重複を避けるため、異なる負の値を使用）
			await Promise.all(
				items.map((item, index) =>
					tx.workspace.update({
						where: {
							id: item.id,
							userId,
							isDefault: false,
						},
						data: {
							order: -(index + 1000000), // 各アイテムに異なる負の値を設定
						},
					}),
				),
			)

			// 最終的な順序に更新
			await Promise.all(
				items.map((item) =>
					tx.workspace.update({
						where: {
							id: item.id,
							userId,
							isDefault: false,
						},
						data: {
							order: item.order,
						},
					}),
				),
			)
		})

		// 更新後のワークスペースを取得して返す
		const updatedWorkspaces = await db.workspace.findMany({
			where: { userId },
			orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
		})

		return NextResponse.json({
			success: true,
			data: updatedWorkspaces,
		})
	} catch (error) {
		console.error('Reorder error:', error)
		return NextResponse.json(
			{ success: false, error: 'サーバーエラーが発生しました' },
			{ status: 500 },
		)
	}
}
