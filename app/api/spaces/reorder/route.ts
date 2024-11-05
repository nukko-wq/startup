import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { items } = await req.json()

		await db.$transaction(
			items.map((item: { id: string; order: number }) =>
				db.space.update({
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

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error reordering spaces:', error)
		return NextResponse.json(
			{ error: 'Failed to reorder spaces' },
			{ status: 500 },
		)
	}
}
