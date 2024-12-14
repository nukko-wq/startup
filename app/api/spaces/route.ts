// POST: スペース作成
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Space } from '@prisma/client'
import { serializeSpace } from '@/app/lib/utils/space'
import { getCurrentUser } from '@/lib/session'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { name, workspaceId } = await request.json()

		const space: Space = await prisma.space.create({
			data: {
				name,
				workspace: {
					connect: {
						id: workspaceId,
					},
				},
				user: {
					connect: {
						email: user.email,
					},
				},
				order: await prisma.space.count({
					where: { workspaceId: workspaceId },
				}),
				isDefault: false,
				isLastActive: false,
			},
		})

		return NextResponse.json(serializeSpace(space))
	} catch (error) {
		return NextResponse.json(
			{ error: 'スペースの作成に失敗しました' },
			{ status: 500 },
		)
	}
}
