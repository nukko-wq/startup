// app/api/sections/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { serializeSection } from '@/app/lib/utils/section'
import { validateSpaceOwnership, OwnershipError } from '@/lib/ownership-utils'
import { createSectionSchema } from '@/lib/validation-schemas'
import {
	validateRequestBody,
	handleValidationError,
} from '@/lib/validation-utils'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const body = await request.json()
		const { name, spaceId } = validateRequestBody(body, createSectionSchema)

		// スペースの所有権確認
		await validateSpaceOwnership(spaceId, user.id)

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
		if (error instanceof OwnershipError) {
			return NextResponse.json({ error: error.message }, { status: 403 })
		}
		try {
			return handleValidationError(error)
		} catch {
			return NextResponse.json(
				{ error: 'セクションの作成に失敗しました' },
				{ status: 500 },
			)
		}
	}
}
