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

		// トランザクションで処理
		const space = await prisma.$transaction(async (tx) => {
			// 同じワークスペース内の全スペースのisLastActiveをfalseに設定
			await tx.space.updateMany({
				where: { workspaceId },
				data: { isLastActive: false },
			})

			// 新しいスペースを作成
			return await tx.space.create({
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
					order: await tx.space.count({
						where: { workspaceId: workspaceId },
					}),
					isDefault: false,
					isLastActive: true,
				},
			})
		})

		return NextResponse.json(serializeSpace(space))
	} catch (error) {
		return NextResponse.json(
			{ error: 'スペースの作成に失敗しました' },
			{ status: 500 },
		)
	}
}
