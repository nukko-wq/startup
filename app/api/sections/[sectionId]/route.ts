// DELETE セクションの削除
// PATCH セクションの更新

import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { serializeSection } from '@/app/lib/redux/features/section/types/section'
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ sectionId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const resolvedParams = await params
		const { sectionId } = resolvedParams

		const section = await prisma.section.findUnique({
			where: { id: sectionId },
		})

		if (!section) {
			return NextResponse.json(
				{ error: 'セクションが見つかりません' },
				{ status: 404 },
			)
		}

		if (section.userId !== user.id) {
			return NextResponse.json({ error: '権限がありません' }, { status: 403 })
		}

		await prisma.section.delete({
			where: { id: sectionId },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		return NextResponse.json(
			{ error: 'セクションの削除に失敗しました' },
			{ status: 500 },
		)
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ sectionId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const resolvedParams = await params
		const { sectionId } = resolvedParams
		const { name } = await request.json()
		const section = await prisma.section.findUnique({
			where: { id: sectionId },
		})

		if (!section) {
			return NextResponse.json(
				{ error: 'セクションが見つかりません' },
				{ status: 404 },
			)
		}

		if (section.userId !== user.id) {
			return NextResponse.json({ error: '権限がありません' }, { status: 403 })
		}

		const updatedSection = await prisma.section.update({
			where: { id: sectionId },
			data: { name },
		})

		return NextResponse.json(serializeSection(updatedSection))
	} catch (error) {
		return NextResponse.json(
			{ error: 'セクション名の更新に失敗しました' },
			{ status: 500 },
		)
	}
}
