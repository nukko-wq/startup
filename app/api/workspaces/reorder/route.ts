import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

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
		console.log('Received payload:', body)

		if (!body || !body.items || !Array.isArray(body.items)) {
			return NextResponse.json(
				{ success: false, error: '無効なリクエストデータです' },
				{ status: 400 },
			)
		}

		const { items } = body

		await db.$transaction(
			items.map((item: { id: string; order: number }) =>
				db.workspace.update({
					where: {
						id: item.id,
						userId: user.id,
					},
					data: {
						order: item.order,
					},
				}),
			),
		)

		// 更新後のワークスペースを取得
		const updatedWorkspaces = await db.workspace.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				order: 'asc',
			},
		})

		return NextResponse.json({
			success: true,
			message: '並び順を更新しました',
			data: updatedWorkspaces, // 更新後のデータを含める
		})
	} catch (error) {
		console.error('Error reordering workspaces:', error)
		return NextResponse.json(
			{ success: false, error: 'ワークスペースの並び順の更新に失敗しました' },
			{ status: 500 },
		)
	}
}
