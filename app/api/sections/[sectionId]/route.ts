import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sectionSchema } from '@/lib/validations/section'

export async function DELETE(request: Request) {
	try {
		const session = await auth()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
		}

		const url = new URL(request.url)
		const sectionId = url.pathname.split('/').pop()

		if (!sectionId) {
			return NextResponse.json(
				{ error: 'Section ID is required' },
				{ status: 400 },
			)
		}

		const { user } = session

		// トランザクションを使用してセクションとそれに関連するリソースを削除
		await db.$transaction(async (tx) => {
			// 削除対象のセクションを取得
			const targetSection = await tx.section.findUnique({
				where: {
					id: sectionId,
					userId: user.id,
				},
			})

			if (!targetSection) {
				throw new Error('Section not found')
			}

			// 関連リソースを削除
			await tx.resource.deleteMany({
				where: {
					sectionId,
					userId: user.id,
				},
			})

			// セクションを削除
			await tx.section.delete({
				where: {
					id: sectionId,
					userId: user.id,
				},
			})

			// 削除したセクションより大きいorderを持つセクションのorderを更新
			await tx.section.updateMany({
				where: {
					userId: user.id,
					order: {
						gt: targetSection.order,
					},
				},
				data: {
					order: {
						decrement: 1,
					},
				},
			})
		})

		return NextResponse.json({
			success: true,
			message: 'Section and related resources deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting section:', error)
		return NextResponse.json(
			{
				success: false,
				message: 'Failed to delete section',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}

export async function PATCH(request: Request) {
	try {
		const session = await auth()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
		}

		const url = new URL(request.url)
		const sectionId = url.pathname.split('/').pop()

		if (!sectionId) {
			return NextResponse.json(
				{ error: 'Section ID is required' },
				{ status: 400 },
			)
		}

		const json = await request.json()
		const validatedData = sectionSchema.parse(json)

		const section = await db.section.update({
			where: {
				id: sectionId,
				userId: session.user.id,
			},
			data: {
				name: validatedData.name,
			},
		})

		return NextResponse.json({
			success: true,
			message: 'Section updated successfully',
			name: section.name,
			id: section.id,
		})
	} catch (error) {
		console.error('Error updating section:', error)
		if (error instanceof Error) {
			return NextResponse.json(
				{
					success: false,
					message: error.message,
				},
				{ status: 500 },
			)
		}
		return NextResponse.json(
			{
				success: false,
				message: 'Unknown error occurred',
			},
			{ status: 500 },
		)
	}
}
