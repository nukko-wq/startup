import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json(
				{ success: false, message: '認証が必要です' },
				{ status: 401 },
			)
		}

		const { items } = await req.json()

		// トランザクションを使用して一括更新
		await db.$transaction(
			items.map((item: { id: string; order: number }) =>
				db.section.update({
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

		return NextResponse.json({
			success: true,
			message: '並び順を更新しました',
		})
	} catch (error) {
		console.error('Error updating section order:', error)
		return NextResponse.json(
			{
				success: false,
				message: '並び順の更新に失敗しました',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}
