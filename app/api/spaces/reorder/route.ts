import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { workspaceId, spaces } = await request.json()

		// トランザクションで一括更新
		await prisma.$transaction(
			spaces.map(({ id, order }: { id: string; order: number }) =>
				prisma.space.update({
					where: { id },
					data: { order },
				}),
			),
		)

		// 全てのスペースを返す（ユーザーに紐づくもの）
		const updatedSpaces = await prisma.space.findMany({
			where: {
				userId: user.id,
				// workspaceIdの条件を削除
			},
			orderBy: [{ workspaceId: 'asc' }, { order: 'asc' }],
		})

		return NextResponse.json(updatedSpaces)
	} catch (error) {
		return NextResponse.json(
			{ error: 'スペースの順序更新に失敗しました' },
			{ status: 500 },
		)
	}
}
