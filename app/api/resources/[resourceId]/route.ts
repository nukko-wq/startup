import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json(
				{ error: 'ユーザーが見つかりません' },
				{ status: 401 },
			)
		}

		const resolvedParams = await params
		const { resourceId } = resolvedParams

		// 削除対象のリソースを取得して、sectionIdとorderを取得
		const targetResource = await prisma.resource.findUnique({
			where: { id: resourceId },
			select: { sectionId: true, order: true },
		})

		if (!targetResource) {
			return NextResponse.json(
				{ error: 'リソースが見つかりません' },
				{ status: 404 },
			)
		}

		// トランザクションで削除と順序更新を実行
		await prisma.$transaction(async (tx) => {
			// リソースを削除
			await tx.resource.delete({
				where: { id: resourceId },
			})

			// 同じセクション内の、削除したリソースより大きいorderを持つリソースのorderを-1する
			await tx.resource.updateMany({
				where: {
					sectionId: targetResource.sectionId,
					order: { gt: targetResource.order },
				},
				data: {
					order: { decrement: 1 },
				},
			})
		})

		return NextResponse.json({ message: '削除成功' })
	} catch (error) {
		return NextResponse.json(
			{ error: 'リソースの削除に失敗しました' },
			{ status: 500 },
		)
	}
}
