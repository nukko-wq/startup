import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sectionSchema, sectionNameSchema } from '@/lib/validations/section'

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

		await db.$transaction(async (tx) => {
			const existingSection = await tx.section.findUnique({
				where: { id: sectionId, userId: user.id },
			})

			if (!existingSection) {
				return NextResponse.json(
					{ error: 'Section not found or already deleted' },
					{ status: 404 },
				)
			}

			await tx.resource.deleteMany({
				where: { sectionId, userId: user.id },
			})

			await tx.section.delete({
				where: { id: sectionId, userId: user.id },
			})

			await tx.section.updateMany({
				where: {
					userId: user.id,
					order: { gt: existingSection.order },
				},
				data: { order: { decrement: 1 } },
			})
		})

		return NextResponse.json({
			success: true,
			message: 'Section deleted successfully',
		})
	} catch (error) {
		console.error('Section deletion error:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'Unknown error occurred',
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
		const validatedData = sectionNameSchema.parse(json)

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
