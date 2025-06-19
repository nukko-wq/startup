import { serializeSpace } from '@/app/lib/utils/space'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { validateWorkspaceOwnership, OwnershipError } from '@/lib/ownership-utils'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const { name, workspaceId } = await request.json()

		// ワークスペースの所有権確認
		await validateWorkspaceOwnership(workspaceId, user.id)

		// トランザクションで処理
		const result = await prisma.$transaction(async (tx) => {
			// 同じワークスペース内の全スペースのisLastActiveをfalseに設定
			await tx.space.updateMany({
				where: { workspaceId },
				data: { isLastActive: false },
			})

			// 新しいスペースを作成
			const newSpace = await tx.space.create({
				data: {
					name,
					workspace: {
						connect: {
							id: workspaceId,
						},
					},
					user: {
						connect: {
							id: user.id,
						},
					},
					order: await tx.space.count({
						where: { workspaceId: workspaceId },
					}),
					isDefault: false,
					isLastActive: true,
				},
			})

			// デフォルトのセクションを作成
			const newSection = await tx.section.create({
				data: {
					name: 'Resources',
					order: 0,
					space: {
						connect: {
							id: newSpace.id,
						},
					},
					user: {
						connect: {
							id: user.id,
						},
					},
				},
			})

			return {
				space: newSpace,
				section: newSection,
			}
		})

		return NextResponse.json({
			...serializeSpace(result.space),
			section: result.section,
		})
	} catch (error) {
		if (error instanceof OwnershipError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: 403 }
			)
		}
		return NextResponse.json(
			{ error: 'スペースの作成に失敗しました' },
			{ status: 500 },
		)
	}
}
