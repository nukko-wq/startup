import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return new NextResponse(
				JSON.stringify({
					success: false,
					error: '認証が必要です',
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				},
			)
		}

		const user = await db.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			return new NextResponse(
				JSON.stringify({
					success: false,
					error: 'ユーザーが見つかりません',
				}),
				{
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				},
			)
		}

		let workspace = await db.workspace.findFirst({
			where: {
				userId,
				isDefault: true,
			},
			select: {
				id: true,
				name: true,
				order: true,
				userId: true,
				isDefault: true,
			},
		})

		if (!workspace) {
			workspace = await db.$transaction(async (tx) => {
				return tx.workspace.create({
					data: {
						name: 'Default Workspace',
						order: 0,
						isDefault: true,
						userId,
					},
					select: {
						id: true,
						name: true,
						order: true,
						userId: true,
						isDefault: true,
					},
				})
			})
		}

		return new NextResponse(
			JSON.stringify({
				success: true,
				data: workspace,
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	} catch (error) {
		console.error('Default workspace fetch error:', error)
		return new NextResponse(
			JSON.stringify({
				success: false,
				error: 'デフォルトワークスペースの取得に失敗しました',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
}
