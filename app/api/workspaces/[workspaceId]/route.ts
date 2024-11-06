import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { workspaceUpdateSchema } from '@/lib/validations/workspace'
import { z } from 'zod'

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

export async function PATCH(request: Request) {
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

		const json = await request.json()
		const body = workspaceUpdateSchema.parse(json)

		const workspace = await db.workspace.update({
			where: {
				id: workspaceId,
				userId,
			},
			data: {
				name: body.name,
			},
		})

		return NextResponse.json(workspace)
	} catch (error) {
		console.error('Workspace update error:', error)
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'バリデーションエラー', details: error.issues },
				{ status: 422 },
			)
		}
		return NextResponse.json(
			{ error: 'ワークスペースの更新に失敗しました' },
			{ status: 500 },
		)
	}
}
