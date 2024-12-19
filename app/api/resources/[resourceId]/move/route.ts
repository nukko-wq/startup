import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(
	request: Request,
	{ params }: { params: { resourceId: string } },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { resourceId } = params
		const { fromSectionId, toSectionId, newIndex } = await request.json()

		await prisma.$transaction(async (tx) => {
			// リソースの移動
			await tx.resource.update({
				where: { id: resourceId },
				data: { sectionId: toSectionId },
			})

			// 移動先セクションのリソースの順序を更新
			const toSectionResources = await tx.resource.findMany({
				where: { sectionId: toSectionId },
				orderBy: { order: 'asc' },
			})

			// 新しい位置に挿入して順序を更新
			for (let i = newIndex; i < toSectionResources.length; i++) {
				await tx.resource.update({
					where: { id: toSectionResources[i].id },
					data: { order: i + 1 },
				})
			}

			// 移動元セクションのリソースの順序を更新
			const fromSectionResources = await tx.resource.findMany({
				where: { sectionId: fromSectionId },
				orderBy: { order: 'asc' },
			})

			for (let i = 0; i < fromSectionResources.length; i++) {
				await tx.resource.update({
					where: { id: fromSectionResources[i].id },
					data: { order: i },
				})
			}
		})

		const updatedResource = await prisma.resource.findUnique({
			where: { id: resourceId },
		})

		return NextResponse.json(updatedResource)
	} catch (error) {
		console.error('リソース移動エラー:', error)
		return NextResponse.json(
			{ error: 'リソースの移動に失敗しました' },
			{ status: 500 },
		)
	}
}
