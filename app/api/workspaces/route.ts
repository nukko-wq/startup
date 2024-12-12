// GET: Workspace取得

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const workspaces = await db.workspace.findMany({
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
