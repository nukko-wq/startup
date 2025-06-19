// app/api/sections/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { serializeSection } from '@/app/lib/utils/section'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { name, spaceId } = await request.json()

		const lastSection = await prisma.section.findFirst({
			where: { spaceId },
			orderBy: { order: 'desc' },
		})

		const newOrder = lastSection ? lastSection.order + 1 : 0

		const section = await prisma.section.create({
			data: {
				name,
				spaceId,
				userId: user.id,
				order: newOrder,
			},
		})

		return NextResponse.json(serializeSection(section))
	} catch (error) {
		return NextResponse.json(
			{ error: 'セクションの作成に失敗しました' },
			{ status: 500 },
		)
	}
}
