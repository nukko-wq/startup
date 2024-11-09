import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
	request: Request,
	{ params }: { params: { spaceId: string } },
) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const spaceId = params.spaceId

		const sections = await db.section.findMany({
			where: {
				spaceId: spaceId,
				userId: userId,
			},
			include: {
				resources: {
					orderBy: {
						position: 'asc',
					},
				},
			},
			orderBy: {
				order: 'asc',
			},
		})

		return NextResponse.json({ sections })
	} catch (error) {
		console.error('Sections fetch error:', error)
		return NextResponse.json(
			{ error: 'セクションの取得に失敗しました' },
			{ status: 500 },
		)
	}
}
