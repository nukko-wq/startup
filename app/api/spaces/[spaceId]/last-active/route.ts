// PATCH /api/spaces/[spaceId]/last-active

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ spaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { spaceId } = resolvedParams
		const { workspaceId } = await req.json()

		// トランザクションで更新
		const updatedSpace = await prisma.$transaction(async (tx) => {
			// 同じワークスペース内の全スペースのisLastActiveをfalseに設定
			await tx.space.updateMany({
				where: { workspaceId },
				data: { isLastActive: false },
			})

			// 選択されたスペースのisLastActiveをtrueに設定
			return await tx.space.update({
				where: { id: spaceId },
				data: { isLastActive: true },
			})
		})

		return NextResponse.json(updatedSpace)
	} catch (error) {
		console.error('アクティブスペース更新エラー:', error)
		return new NextResponse('内部サーバーエラー', { status: 500 })
	}
}
