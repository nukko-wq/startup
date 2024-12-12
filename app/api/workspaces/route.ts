// GET: Workspace取得
// POST: Workspace作成

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const workspaces = await prisma.workspace.findMany({
			where: {
				userId: user.id,
			},
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(workspaces)
	} catch (error) {
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { name } = body

		// 最大のorderを取得
		const maxOrderWorkspace = await prisma.workspace.findFirst({
			where: { userId: user.id },
			orderBy: { order: 'desc' },
		})
		const newOrder = maxOrderWorkspace ? maxOrderWorkspace.order + 1 : 1

		const workspace = await prisma.workspace.create({
			data: {
				name,
				order: newOrder,
				isDefault: false,
				userId: user.id,
			},
		})

		return NextResponse.json(workspace)
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 },
		)
	}
}
