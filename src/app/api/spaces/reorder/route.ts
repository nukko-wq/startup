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
				// 同じワークスペース内のすべてのスペースを取得
				const workspaceSpaces = await tx.space.findMany({
					where: {
						workspaceId: destinationWorkspaceId,
						userId: user.id,
					},
					orderBy: { order: 'asc' },
				})

				// @hello-pangea/dndの動作をシミュレート
				const sourceIndex = workspaceSpaces.findIndex((s) => s.id === spaceId)

				// 配列を複製して並び替えを実行
				const reorderedSpaces = [...workspaceSpaces]

				// 元の位置から削除
				const [movedSpace] = reorderedSpaces.splice(sourceIndex, 1)

				// 新しい位置に挿入
				reorderedSpaces.splice(newOrder, 0, movedSpace)

				// 順序を更新
				for (let i = 0; i < reorderedSpaces.length; i++) {
					await tx.space.update({
						where: { id: reorderedSpaces[i].id },
						data: { order: i },
					})
				}
			}
			// 異なるワークスペース間での移動の場合
			else {
				// 元のワークスペースの順序を詰める
				await tx.space.updateMany({
					where: {
						workspaceId: space.workspaceId,
						order: { gt: space.order },
						userId: user.id,
					},
					data: { order: { decrement: 1 } },
				})

				// 移動先ワークスペースのスペースを取得
				const destinationSpaces = await tx.space.findMany({
					where: {
						workspaceId: destinationWorkspaceId,
						userId: user.id,
					},
					orderBy: { order: 'asc' },
				})

				// 新しい位置に挿入するために、指定位置以降の順序を1つずつ増やす
				await tx.space.updateMany({
					where: {
						workspaceId: destinationWorkspaceId,
						order: { gte: newOrder },
						userId: user.id,
					},
					data: { order: { increment: 1 } },
				})

				// スペースを新しいワークスペースに移動
				await tx.space.update({
					where: { id: spaceId },
					data: {
						workspaceId: destinationWorkspaceId,
						order: newOrder,
					},
				})
			}
		})

		// 更新後のスペースを取得して返す
		const updatedSpaces = await prisma.space.findMany({
			where: { userId: user.id },
			orderBy: [{ workspaceId: 'asc' }, { order: 'asc' }],
		})

		return NextResponse.json(updatedSpaces)
	} catch (error) {
		console.error('Space reorder error:', error)
		return NextResponse.json(
			{ error: 'スペースの順序更新に失敗しました' },
			{ status: 500 },
		)
	}
}
