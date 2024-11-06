import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		let workspace = await db.workspace.findFirst({
			where: {
				userId,
				isDefault: true,
			},
		})

		if (!workspace) {
			// デフォルトワークスペースが存在しない場合は作成
			workspace = await db.workspace.create({
				data: {
					name: 'Default Workspace',
					order: 0,
					isDefault: true,
					userId,
				},
			})
		}

		return NextResponse.json(workspace)
	} catch (error) {
		console.error('Default workspace fetch error:', error)
		return NextResponse.json(
			{ error: 'デフォルトワークスペースの取得に失敗しました' },
			{ status: 500 },
		)
	}
}
