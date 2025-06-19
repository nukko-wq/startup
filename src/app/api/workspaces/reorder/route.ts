import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { reorderWorkspacesSchema } from '@/lib/validation-schemas'
import { validateRequestBody, handleValidationError } from '@/lib/validation-utils'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const body = await request.json()
		const { workspaces } = validateRequestBody(body, reorderWorkspacesSchema)

		// 全ワークスペースの所有権確認
		const workspaceIds = workspaces.map(w => w.id)
		const ownedWorkspaces = await prisma.workspace.findMany({
			where: {
				id: { in: workspaceIds },
				userId: user.id,
			},
			select: { id: true },
		})

		const ownedWorkspaceIds = new Set(ownedWorkspaces.map(w => w.id))
		const unauthorizedIds = workspaceIds.filter(id => !ownedWorkspaceIds.has(id))

		if (unauthorizedIds.length > 0) {
			return NextResponse.json(
				{ error: 'アクセス権限のないワークスペースが含まれています' },
				{ status: 403 }
			)
		}

		// トランザクションで一括更新（所有権確認済み）
		await prisma.$transaction(
			workspaces.map(({ id, order }) =>
				prisma.workspace.update({
					where: { 
						id,
						userId: user.id, // 追加の安全チェック
					},
					data: { order },
				}),
			),
		)

		const updatedWorkspaces = await prisma.workspace.findMany({
			where: { userId: user.id },
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(updatedWorkspaces)
	} catch (error) {
		try {
			return handleValidationError(error)
		} catch {
			return NextResponse.json(
				{ error: 'ワークスペースの順序更新に失敗しました' },
				{ status: 500 },
			)
		}
	}
}
