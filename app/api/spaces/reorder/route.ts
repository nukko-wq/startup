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

		const updatedSpaces = await prisma.$transaction(async (tx) => {
			// 移動するスペースの現在の情報を取得
			const space = await tx.space.findUnique({
				where: { id: spaceId },
			})

			if (!space) {
				throw new Error('スペースが見つかりません')
			}

			// 同じワークスペース内での移動の場合
			if (sourceWorkspaceId === destinationWorkspaceId) {
				if (space.order < newOrder) {
					// 下に移動する場合
					await tx.space.updateMany({
						where: {
							workspaceId: sourceWorkspaceId,
							order: {
								gt: space.order,
								lte: newOrder,
							},
						},
						data: { order: { decrement: 1 } },
					})
				} else {
					// 上に移動する場合
					await tx.space.updateMany({
						where: {
							workspaceId: sourceWorkspaceId,
							order: {
								gte: newOrder,
								lt: space.order,
							},
						},
						data: { order: { increment: 1 } },
					})
				}
			} else {
				// 異なるワークスペース間での移動の場合
				// 移動元の後続スペースの順序を更新
				await tx.space.updateMany({
					where: {
						workspaceId: sourceWorkspaceId,
						order: { gt: space.order },
					},
					data: { order: { decrement: 1 } },
				})

				// 移動先の既存スペースの順序を更新
				await tx.space.updateMany({
					where: {
						workspaceId: destinationWorkspaceId,
						order: { gte: newOrder },
					},
					data: { order: { increment: 1 } },
				})
			}

			// スペースを移動
			await tx.space.update({
				where: { id: spaceId },
				data: {
					workspaceId: destinationWorkspaceId,
					order: newOrder,
				},
			})

			// 更新後のスペースを取得
			return await tx.space.findMany({
				where: {
					userId: user.id,
				},
				orderBy: [{ workspaceId: 'asc' }, { order: 'asc' }],
			})
		})

		return NextResponse.json(updatedSpaces)
	} catch (error) {
		console.error('Error in reorder spaces:', error)
		return NextResponse.json(
			{ error: 'スペースの順序更新に失敗しました' },
			{ status: 500 },
		)
	}
}
