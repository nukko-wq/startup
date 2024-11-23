import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

interface ResourceItem {
	id: string
	position: number
	sectionId: string
}

interface RequestBody {
	items: ResourceItem[]
}

export async function PUT(req: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json(
				{ success: false, message: 'Unauthorized' },
				{ status: 401 },
			)
		}

		const body = (await req.json()) as RequestBody

		if (!body || !body.items || !Array.isArray(body.items)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid request body' },
				{ status: 400 },
			)
		}

		// バリデーション
		const isValidItem = (item: unknown): item is ResourceItem => {
			if (!item || typeof item !== 'object') return false

			const typedItem = item as Record<string, unknown>
			return (
				typeof typedItem.id === 'string' &&
				typeof typedItem.position === 'number' &&
				typeof typedItem.sectionId === 'string'
			)
		}

		if (!body.items.every(isValidItem)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid item format' },
				{ status: 400 },
			)
		}

		// トランザクションを使用して一括更新
		await db.$transaction(
			body.items.map((item: ResourceItem) =>
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
			message: 'Resources reordered successfully',
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
