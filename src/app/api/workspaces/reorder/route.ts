import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { workspaces } = await request.json()

		// トランザクションで一括更新
		await prisma.$transaction(
			workspaces.map(({ id, order }: { id: string; order: number }) =>
				prisma.workspace.update({
					where: { id },
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
		return NextResponse.json(
			{ error: 'ワークスペースの順序更新に失敗しました' },
			{ status: 500 },
		)
	}
}
