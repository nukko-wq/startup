// DELETE /api/workspaces/[workspaceId]

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ workspaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { workspaceId } = resolvedParams

		const workspace = await prisma.workspace.findUnique({
			where: {
				id: workspaceId,
			},
		})

		if (!workspace) {
			return new NextResponse('Workspace not found', { status: 404 })
		}

		// ユーザーが所有者であることを確認
		if (workspace.userId !== user.id) {
			return new NextResponse('Forbidden', { status: 403 })
		}

		// デフォルトワークスペースは削除できない
		if (workspace.isDefault) {
			return new NextResponse('Cannot delete default workspace', {
				status: 400,
			})
		}

		// ワークスペースを削除
		await prisma.workspace.delete({
			where: {
				id: workspaceId,
			},
		})

		return new NextResponse(null, { status: 204 })
	} catch (error) {
		console.error('Error in DELETE /api/workspaces/[workspaceId]:', error)
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}
