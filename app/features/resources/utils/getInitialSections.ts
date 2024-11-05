import { db } from '@/lib/db'
import { cache } from 'react'

export const getInitialSections = cache(
	async (userId: string, spaceId?: string) => {
		console.log('getInitialSections called with userId:', userId)

		if (!userId) {
			throw new Error('ユーザーIDが必要です')
		}

		if (!spaceId) {
			return { sections: [], userId, spaceId: null }
		}

		try {
			const space = await db.space.findUnique({
				where: {
					id: spaceId,
					userId,
				},
			})

			if (!space) {
				return { sections: [], userId, spaceId }
			}

			const sections = await db.section.findMany({
				where: {
					userId: userId,
					spaceId: spaceId,
				},
				select: {
					id: true,
					name: true,
					order: true,
					createdAt: true,
					resources: {
						orderBy: {
							position: 'asc',
						},
					},
				},
				orderBy: {
					order: 'asc',
				},
			})

			return { sections, userId, spaceId }
		} catch (error) {
			console.error('Error in getInitialSections:', error)
			throw error
		}
	},
)
