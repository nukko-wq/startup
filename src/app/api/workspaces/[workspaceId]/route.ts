// DELETE ワークスペースの削除
// PATCH ワークスペース名の編集

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { type NextRequest, NextResponse } from 'next/server'
import { serializeWorkspace } from '@/app/lib/utils/workspace'
import { APIErrors, createErrorResponse } from '@/lib/validation-utils'
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ workspaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return APIErrors.UNAUTHORIZED()
		}

		const resolvedParams = await params
		const { workspaceId } = resolvedParams

		const workspace = await prisma.workspace.findUnique({
			where: {
				id: workspaceId,
			},
		})

		if (!workspace) {
			return APIErrors.NOT_FOUND('Workspace not found')
		}

		// ユーザーが所有者であることを確認
		if (workspace.userId !== user.id) {
			return APIErrors.FORBIDDEN()
		}

		// デフォルトワークスペースは削除できない
		if (workspace.isDefault) {
			return createErrorResponse('Cannot delete default workspace', 400)
		}

		// トランザクションで削除と再整列を実行
		await prisma.$transaction(async (tx) => {
			// ワークスペースを削除
			await tx.workspace.delete({
				where: {
					id: workspaceId,
				},
			})

			// 削除後の全ワークスペースを取得して再整列
			const remainingWorkspaces = await tx.workspace.findMany({
				where: {
					userId: user.id,
				},
				orderBy: {
					order: 'asc',
				},
			})

			// orderを更新
			for (let i = 0; i < remainingWorkspaces.length; i++) {
				await tx.workspace.update({
					where: { id: remainingWorkspaces[i].id },
					data: { order: i },
				})
			}
		})

		return new NextResponse(null, { status: 204 })
	} catch {
		return APIErrors.INTERNAL_SERVER_ERROR()
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ workspaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return APIErrors.UNAUTHORIZED()
		}

		const resolvedParams = await params
		const { workspaceId } = resolvedParams

		const workspace = await prisma.workspace.findUnique({
			where: {
				id: workspaceId,
			},
		})

		if (!workspace) {
			return APIErrors.NOT_FOUND('Workspace not found')
		}

		// ユーザーが所有者であることを確認
		if (workspace.userId !== user.id) {
			return APIErrors.FORBIDDEN()
		}

		const body = await request.json()
		const { name } = body

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return createErrorResponse('Invalid workspace name', 400)
		}

		// ワークスペース名を更新
		const updatedWorkspace = await prisma.workspace.update({
			where: {
				id: workspaceId,
			},
			data: {
				name: name.trim(),
			},
		})

		return new NextResponse(
			JSON.stringify(serializeWorkspace(updatedWorkspace)),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
	} catch {
		return APIErrors.INTERNAL_SERVER_ERROR()
	}
}
