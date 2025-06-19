import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { spaceId, sections } = await request.json()

		// トランザクションで一括更新
		await prisma.$transaction(
			sections.map(({ id, order }: { id: string; order: number }) =>
				prisma.section.update({
					where: { id },
					data: { order },
				}),
			),
		)

		const updatedSections = await prisma.section.findMany({
			where: { spaceId },
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(updatedSections)
	} catch (error) {
		return NextResponse.json(
			{ error: 'セクションの順序更新に失敗しました' },
			{ status: 500 },
		)
	}
}
