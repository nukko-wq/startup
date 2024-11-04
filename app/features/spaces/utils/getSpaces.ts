import { db } from '@/lib/db'
import { cache } from 'react'

export const getSpaces = cache(async (userId: string) => {
	if (!userId) {
		throw new Error('ユーザーIDが必要です')
	}

	const spaces = await db.space.findMany({
		where: {
			userId,
		},
		orderBy: {
			order: 'asc',
		},
		select: {
			id: true,
			name: true,
			order: true,
		},
	})

	return spaces
})
