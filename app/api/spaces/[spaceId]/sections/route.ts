import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ spaceId: string }> },
) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { spaceId } = await context.params

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

		const resources = sections.flatMap((section) => section.resources)

		const cleanSections = sections.map(({ resources, ...section }) => section)

		return NextResponse.json({
			sections: cleanSections,
			resources: resources,
		})
	} catch (error) {
		console.error('Sections fetch error:', error)
		return NextResponse.json(
			{ error: 'セクションの取得に失敗しました' },
			{ status: 500 },
		)
	}
}
