import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { destinationWorkspaceId, spaceId, newOrder } = await request.json()

		await prisma.$transaction(async (tx) => {
			const space = await tx.space.findUnique({
				where: { id: spaceId },
			})

			if (!space) {
				throw new Error('スペースが見つかりません')
			}

			// 同じワークスペース内での移動の場合
			if (space.workspaceId === destinationWorkspaceId) {
				if (space.order < newOrder) {
					// 上から下への移動
					await tx.space.updateMany({
						where: {
							workspaceId: destinationWorkspaceId,
							order: {
								gt: space.order,
								lte: newOrder,
							},
						},
						data: { order: { decrement: 1 } },
					})
				} else {
					// 下から上への移動
					await tx.space.updateMany({
						where: {
							workspaceId: destinationWorkspaceId,
							order: {
								gte: newOrder,
								lt: space.order,
							},
						},
						data: { order: { increment: 1 } },
					})
				}
			}
			// 異なるワークスペース間での移動の場合
			else {
				// 元のワークスペースの順序を更新
				await tx.space.updateMany({
					where: {
						workspaceId: space.workspaceId,
						order: { gt: space.order },
					},
					data: { order: { decrement: 1 } },
				})

				// 移動先ワークスペースの順序を更新
				await tx.space.updateMany({
					where: {
						workspaceId: destinationWorkspaceId,
						order: { gte: newOrder },
					},
					data: { order: { increment: 1 } },
				})
			}

			// スペースを更新
			await tx.space.update({
				where: { id: spaceId },
				data: {
					workspaceId: destinationWorkspaceId,
					order: newOrder,
				},
			})
		})

		// 更新後のスペースを取得して返す
		const updatedSpaces = await prisma.space.findMany({
			where: { userId: user.id },
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(updatedSpaces)
	} catch (error) {
		return NextResponse.json(
			{ error: 'スペースの順序更新に失敗しました' },
			{ status: 500 },
		)
	}
}
