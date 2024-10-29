import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const body = await req.json()
		const { items } = body

		console.log('ユーザーID:', user.id)
		console.log('受信したアイテム:', items)

		// トランザクションを使用して一括更新
		await db.$transaction(
			items.map((item: { id: string; position: number }) =>
				db.resource.update({
					where: {
						id: item.id,
						userId: user.id,
					},
					data: {
						position: item.position,
					},
				}),
			),
		)
		return NextResponse.json({ message: 'Positions updated successfully' })
	} catch (error) {
		console.error('Error updating positions', error)
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}
