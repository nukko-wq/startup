import { db } from '@/lib/db'
import { cache } from 'react'
import type { Space } from '@/app/types/space'

export const getSpaces = cache(async (userId: string): Promise<Space[]> => {
	if (!userId) {
		throw new Error('ユーザーIDが必要です')
	}

	try {
		const spaces = await db.space.findMany({
			where: {
				userId,
			},
			select: {
				id: true,
				name: true,
				order: true,
				userId: true,
				workspaceId: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: {
				order: 'asc',
			},
		})

		return spaces
	} catch (error) {
		console.error('Error in getSpaces:', error)
		throw error
	}
})
