// DELETE /api/spaces/[spaceId]
// PATCH スペースのリネーム

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

		// 削除対象のスペースを取得
		const targetSpace = await prisma.space.findUnique({
			where: { id: spaceId },
			include: {
				workspace: {
					select: { userId: true },
				},
			},
		})

		if (!targetSpace) {
			return new NextResponse('スペースが見つかりません', { status: 404 })
		}

		if (targetSpace.workspace.userId !== user.id) {
			return new NextResponse('権限がありません', { status: 403 })
		}

		// トランザクションで削除とorder更新を実行
		const result = await prisma.$transaction(async (tx) => {
			// スペースを削除
			const deletedSpace = await tx.space.delete({
				where: { id: spaceId },
			})

			// 同じワークスペース内の、削除したスペースより大きいorderを持つスペースのorderを-1する
			await tx.space.updateMany({
				where: {
					workspaceId: targetSpace.workspaceId,
					order: { gt: targetSpace.order },
				},
				data: {
					order: { decrement: 1 },
				},
			})

			return deletedSpace
		})

		return NextResponse.json(result)
	} catch (error) {
		console.error('スペース削除エラー:', error)
		return new NextResponse('内部サーバーエラー', { status: 500 })
	}
}

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
		const { name } = await req.json()

		if (!name) {
			return new NextResponse('名前は必須です', { status: 400 })
		}

		// スペースの存在確認と権限チェック
		const space = await prisma.space.findUnique({
			where: { id: spaceId },
			include: {
				workspace: {
					select: { userId: true },
				},
			},
		})

		if (!space) {
			return new NextResponse('スペースが見つかりません', { status: 404 })
		}

		if (space.workspace.userId !== user.id) {
			return new NextResponse('権限がありません', { status: 403 })
		}

		// スペース名の更新
		const updatedSpace = await prisma.space.update({
			where: { id: spaceId },
			data: { name },
		})

		return NextResponse.json(updatedSpace)
	} catch (error) {
		console.error('スペース更新エラー:', error)
		return new NextResponse('内部サーバーエラー', { status: 500 })
	}
}
