// GET: Workspace取得
// POST: Workspace作成

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { createWorkspaceSchema } from '@/lib/validation-schemas'
import { validateRequestBody, handleValidationError, APIErrors } from '@/lib/validation-utils'

export async function GET() {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return APIErrors.UNAUTHORIZED()
		}
		const workspaces = await prisma.workspace.findMany({
			where: {
				userId: user.id,
			},
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(workspaces)
	} catch {
		return APIErrors.INTERNAL_SERVER_ERROR()
	}
}

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return APIErrors.UNAUTHORIZED()
		}

		const body = await request.json()
		const { name } = validateRequestBody(body, createWorkspaceSchema)

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
		try {
			return handleValidationError(error)
		} catch {
			return APIErrors.INTERNAL_SERVER_ERROR()
		}
	}
}
