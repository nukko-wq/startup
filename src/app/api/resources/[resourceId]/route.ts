import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { serializeResource } from '@/app/lib/utils/resource'
import { validateResourceOwnership, OwnershipError } from '@/lib/ownership-utils'
import { updateResourceSchema } from '@/lib/validation-schemas'
import { validateRequestBody, handleValidationError } from '@/lib/validation-utils'

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json(
				{ error: 'ユーザーが見つかりません' },
				{ status: 401 },
			)
		}

		const resolvedParams = await params
		const { resourceId } = resolvedParams

		// リソース所有権確認（削除対象のsectionIdとorderも同時に取得）
		const targetResource = await validateResourceOwnership(resourceId, user.id)

		// トランザクションで削除と順序更新を実行
		await prisma.$transaction(async (tx) => {
			// リソースを削除
			await tx.resource.delete({
				where: { id: resourceId },
			})

			// 同じセクション内の、削除したリソースより大きいorderを持つリソースのorderを-1する
			await tx.resource.updateMany({
				where: {
					sectionId: targetResource.sectionId,
					order: { gt: targetResource.order },
				},
				data: {
					order: { decrement: 1 },
				},
			})
		})

		return NextResponse.json({ message: '削除成功' })
	} catch (error) {
		if (error instanceof OwnershipError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: 403 }
			)
		}
		return NextResponse.json(
			{ error: 'リソースの削除に失敗しました' },
			{ status: 500 },
		)
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json(
				{ error: 'ユーザーが見つかりません' },
				{ status: 401 },
			)
		}

		const resolvedParams = await params
		const { resourceId } = resolvedParams
		const body = await request.json()
		const { url, title, description } = validateRequestBody(body, updateResourceSchema)

		// リソース所有権確認
		await validateResourceOwnership(resourceId, user.id)

		// 部分的な更新
		const updatedResource = await prisma.resource.update({
			where: { id: resourceId },
			data: {
				...(url && { url }),
				...(title !== undefined && { title }),
				...(description !== undefined && { description }),
			},
		})

		const serializedResource = serializeResource(updatedResource)
		return NextResponse.json(serializedResource)
	} catch (error) {
		if (error instanceof OwnershipError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: 403 }
			)
		}
		try {
			return handleValidationError(error)
		} catch {
			return NextResponse.json(
				{ error: 'リソースの更新に失敗しました' },
				{ status: 500 },
			)
		}
	}
}
