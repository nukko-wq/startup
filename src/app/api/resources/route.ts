// resources/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const json = await request.json()
		const { title, url, sectionId, faviconUrl } = json

		// セクションの存在確認とユーザー所有権の確認
		const section = await prisma.section.findFirst({
			where: {
				id: sectionId,
				userId: user.id,
			},
		})

		if (!section) {
			return new NextResponse('Section not found', { status: 404 })
		}

		// 最大順序を取得
		const maxOrder = await prisma.resource.findFirst({
			where: { sectionId },
			orderBy: { order: 'desc' },
			select: { order: true },
		})

		const newResource = await prisma.resource.create({
			data: {
				title,
				url,
				faviconUrl,
				sectionId,
				userId: user.id,
				order: maxOrder ? maxOrder.order + 1 : 0,
			},
		})

		return NextResponse.json(newResource)
	} catch (error) {
		console.error('Error in POST /api/resources:', error)
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}
