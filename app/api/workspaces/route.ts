import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { workspaceCreateSchema } from '@/lib/validations/workspace'
import { z } from 'zod'

export async function POST(req: NextRequest) {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const json = await req.json()

		if (!json || typeof json !== 'object') {
			return NextResponse.json(
				{ error: '無効なリクエストデータです' },
				{ status: 400 },
			)
		}

		const body = workspaceCreateSchema.parse(json)

		const workspaceCount = await db.workspace.count({
			where: {
				userId,
			},
		})

		if (workspaceCount >= 10) {
			return NextResponse.json(
				{ error: 'ワークスペースの最大数に達しました' },
				{ status: 400 },
			)
		}

		const maxOrderWorkspace = await db.workspace.findFirst({
			where: {
				userId,
				isDefault: false,
			},
			orderBy: { order: 'desc' },
			select: { order: true },
		})

		const newOrder = maxOrderWorkspace ? maxOrderWorkspace.order + 1 : 1

		const workspace = await db.workspace.create({
			data: {
				name: body.name,
				order: newOrder,
				isDefault: false,
				userId,
			},
		})

		return NextResponse.json(workspace)
	} catch (error) {
		console.error('Workspace creation error:', error)
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'バリデーションエラー', details: error.issues },
				{ status: 422 },
			)
		}
		return NextResponse.json(
			{ error: 'ワークスペースの作成に失敗しました' },
			{ status: 500 },
		)
	}
}
