import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { sourceWorkspaceId, destinationWorkspaceId, spaceId, newOrder } =
			await request.json()

		await prisma.$transaction(async (tx) => {
			// 移動するスペースの現在の情報を取得
			const space = await tx.space.findUnique({
				where: { id: spaceId },
			})

			if (!space) {
				throw new Error('スペースが見つかりません')
			}

			// 移動元ワークスペースの順序を更新
			await tx.space.updateMany({
				where: {
					workspaceId: sourceWorkspaceId,
					order: { gt: space.order },
				},
				data: { order: { decrement: 1 } },
			})

			// 移動先ワークスペースの既存のスペースを取得
			const destinationSpaces = await tx.space.findMany({
				where: { workspaceId: destinationWorkspaceId },
				orderBy: { order: 'asc' },
			})

			// 移動先の新しい順序を決定
			let finalOrder = newOrder
			if (destinationSpaces.length === 0) {
				finalOrder = 0 // スペースが存在しない場合は0から開始
			}

			// 移動先ワークスペースの順序を更新
			await tx.space.updateMany({
				where: {
					workspaceId: destinationWorkspaceId,
					order: { gte: finalOrder },
				},
				data: { order: { increment: 1 } },
			})

			// スペースを移動
			await tx.space.update({
				where: { id: spaceId },
				data: {
					workspaceId: destinationWorkspaceId,
					order: finalOrder,
				},
			})
		})

		// 更新後のスペースを取得
		const updatedSpaces = await prisma.space.findMany({
			where: {
				userId: user.id,
			},
			orderBy: [{ workspaceId: 'asc' }, { order: 'asc' }],
		})

		return NextResponse.json(updatedSpaces)
	} catch (error) {
		return NextResponse.json(
			{ error: 'スペースの順序更新に失敗しました' },
			{ status: 500 },
		)
	}
}
