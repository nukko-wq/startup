import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { resourceId } = resolvedParams
		const { fromSectionId, toSectionId, newIndex } = await request.json()

		await prisma.$transaction(async (tx) => {
			// 移動するリソースを取得
			const resource = await tx.resource.findUnique({
				where: { id: resourceId },
			})
			if (!resource) {
				throw new Error('Resource not found')
			}

			// 移動先のセクションの既存リソースを取得
			const toSectionResources = await tx.resource.findMany({
				where: { sectionId: toSectionId },
				orderBy: { order: 'asc' },
			})

			// 新しい位置以降のリソースの順序を更新
			await tx.resource.updateMany({
				where: {
					sectionId: toSectionId,
					order: { gte: newIndex },
				},
				data: {
					order: { increment: 1 },
				},
			})

			// リソースを移動
			const updatedResource = await tx.resource.update({
				where: { id: resourceId },
				data: {
					sectionId: toSectionId,
					order: newIndex,
				},
			})

			// 移動元セクションのリソースの順序を更新
			const fromSectionResources = await tx.resource.findMany({
				where: {
					sectionId: fromSectionId,
					order: { gt: resource.order },
				},
				orderBy: { order: 'asc' },
			})

			for (const [index, res] of fromSectionResources.entries()) {
				await tx.resource.update({
					where: { id: res.id },
					data: { order: resource.order + index },
				})
			}

			return updatedResource
		})

		return new NextResponse('Success', { status: 200 })
	} catch (error) {
		console.error('Error moving resource:', error)
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}
