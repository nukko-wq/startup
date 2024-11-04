import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const url = new URL(request.url)
		const spaceId = url.pathname.split('/').pop()

		if (!spaceId) {
			return NextResponse.json(
				{ error: 'Space ID is required' },
				{ status: 400 },
			)
		}

		await db.$transaction(async (tx) => {
			// 関連リソースを削除
			await tx.resource.deleteMany({
				where: {
					section: {
						spaceId,
						userId,
					},
				},
			})

			// 関連セクションを削除
			await tx.section.deleteMany({
				where: {
					spaceId,
					userId,
				},
			})

			// スペースを削除
			await tx.space.delete({
				where: {
					id: spaceId,
					userId,
				},
			})
		})

		return NextResponse.json({
			success: true,
			message: 'Space deleted successfully',
		})
	} catch (error) {
		console.error('Space delete error:', error)
		return NextResponse.json(
			{ error: 'Failed to delete space' },
			{ status: 500 },
		)
	}
}
