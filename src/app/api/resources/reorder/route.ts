import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { resourceId, destinationSectionId, newOrder } = await request.json()

		await prisma.$transaction(async (tx) => {
			// 移動するリソースの現在の情報を取得
			const resource = await tx.resource.findUnique({
				where: { id: resourceId },
			})

			if (!resource) {
				throw new Error('リソースが見つかりません')
			}

			// 同じセクション内での移動の場合
			if (resource.sectionId === destinationSectionId) {
				if (resource.order < newOrder) {
					// 上から下への移動
					await tx.resource.updateMany({
						where: {
							sectionId: destinationSectionId,
							order: {
								gt: resource.order,
								lte: newOrder,
							},
						},
						data: { order: { decrement: 1 } },
					})
				} else {
					// 下から上への移動
					await tx.resource.updateMany({
						where: {
							sectionId: destinationSectionId,
							order: {
								gte: newOrder,
								lt: resource.order,
							},
						},
						data: { order: { increment: 1 } },
					})
				}
			}
			// 異なるセクション間での移動の場合
			else {
				// 元のセクションの順序を更新
				await tx.resource.updateMany({
					where: {
						sectionId: resource.sectionId,
						order: { gt: resource.order },
					},
					data: { order: { decrement: 1 } },
				})

				// 移動先セクションの順序を更新
				await tx.resource.updateMany({
					where: {
						sectionId: destinationSectionId,
						order: { gte: newOrder },
					},
					data: { order: { increment: 1 } },
				})
			}

			// リソースを更新
			await tx.resource.update({
				where: { id: resourceId },
				data: {
					sectionId: destinationSectionId,
					order: newOrder,
				},
			})
		})

		// 更新後のリソースを取得して返す
		const updatedResources = await prisma.resource.findMany({
			where: { userId: user.id },
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(updatedResources)
	} catch (error) {
		return NextResponse.json(
			{ error: 'リソースの並び替えに失敗しました' },
			{ status: 500 },
		)
	}
}
