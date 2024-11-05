import { db } from '@/lib/db'
import { cache } from 'react'

export const getWorkspaces = cache(async (userId: string) => {
	if (!userId) {
		throw new Error('ユーザーIDが必要です')
	}

	try {
		const workspaces = await db.workspace.findMany({
			where: {
				userId,
				isDefault: false,
			},
			orderBy: {
				order: 'asc',
			},
			select: {
				id: true,
				name: true,
				order: true,
				userId: true,
				isDefault: true,
			},
		})

		return workspaces
	} catch (error) {
		console.error('Error in getWorkspaces:', error)
		throw error
	}
})
