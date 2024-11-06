import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(request: Request) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const url = new URL(request.url)
		const workspaceId = url.pathname.split('/').pop()

		if (!workspaceId) {
			return NextResponse.json(
				{ error: 'Workspace ID is required' },
				{ status: 400 },
			)
		}

		await db.$transaction(async (tx) => {
			// 関連するスペースとリソースを削除
			const spaces = await tx.space.findMany({
				where: {
					workspaceId,
					userId,
				},
				select: {
					id: true,
				},
			})

			const spaceIds = spaces.map((space) => space.id)

			// 関連リソースを削除
			await tx.resource.deleteMany({
				where: {
					section: {
						spaceId: {
							in: spaceIds,
						},
						userId,
					},
				},
			})

			// 関連セクションを削除
			await tx.section.deleteMany({
				where: {
					spaceId: {
						in: spaceIds,
					},
					userId,
				},
			})

			// 関連スペースを削除
			await tx.space.deleteMany({
				where: {
					workspaceId,
					userId,
				},
			})

			// ワークスペースを削除
			await tx.workspace.delete({
				where: {
					id: workspaceId,
					userId,
				},
			})
		})

		return NextResponse.json({
			success: true,
			message: 'Workspace deleted successfully',
		})
	} catch (error) {
		console.error('Workspace delete error:', error)
		return NextResponse.json(
			{ error: 'Failed to delete workspace' },
			{ status: 500 },
		)
	}
}
