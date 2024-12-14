// DELETE /api/spaces/[spaceId]

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
export async function DELETE(
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

		if (!spaceId) {
			return new NextResponse('スペースIDが必要です', { status: 400 })
		}

		// スペースの存在確認と所有権の確認
		const existingSpace = await prisma.space.findUnique({
			where: {
				id: spaceId,
			},
			include: {
				workspace: {
					select: {
						userId: true,
					},
				},
			},
		})

		if (!existingSpace) {
			return new NextResponse('スペースが見つかりません', { status: 404 })
		}

		if (existingSpace.workspace.userId !== user.id) {
			return new NextResponse('権限がありません', { status: 403 })
		}

		// スペースの削除
		const deletedSpace = await prisma.space.delete({
			where: {
				id: spaceId,
			},
		})

		return NextResponse.json(deletedSpace)
	} catch (error) {
		console.error('スペース削除エラー:', error)
		return new NextResponse('内部サーバーエラー', { status: 500 })
	}
}
