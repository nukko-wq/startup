// resources/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { createResourceSchema } from '@/lib/validation-schemas'
import { validateRequestBody, handleValidationError, APIErrors } from '@/lib/validation-utils'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return APIErrors.UNAUTHORIZED()
		}

		const body = await request.json()
		const { title, url, sectionId, faviconUrl } = validateRequestBody(body, createResourceSchema)

		// セクションの存在確認とユーザー所有権の確認
		const section = await prisma.section.findFirst({
			where: {
				id: sectionId,
				userId: user.id,
			},
		})

		if (!section) {
			return APIErrors.NOT_FOUND('Section not found')
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
		try {
			return handleValidationError(error)
		} catch {
			return APIErrors.INTERNAL_SERVER_ERROR()
		}
	}
}
