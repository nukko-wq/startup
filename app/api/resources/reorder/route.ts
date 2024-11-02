import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json(
				{ success: false, message: 'Unauthorized' },
				{ status: 401 },
			)
		}

		const { items } = await req.json()

		// トランザクションを使用して一括更新
		await db.$transaction(
			items.map((item: { id: string; position: number; sectionId: string }) =>
				db.resource.update({
					where: {
						id: item.id,
						userId: user.id,
					},
					data: {
						position: item.position,
						sectionId: item.sectionId,
					},
				}),
			),
		)

		return NextResponse.json({
			success: true,
			message: 'Positions updated successfully',
		})
	} catch (error) {
		console.error('Error updating positions:', error)
		return NextResponse.json(
			{
				success: false,
				message: 'Failed to update positions',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}
