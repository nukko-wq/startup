import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export const getInitialSections = unstable_cache(
	async (userId: string, spaceId?: string) => {
		console.log('getInitialSections called with userId:', userId)

		if (!userId) {
			throw new Error('ユーザーIDが必要です')
		}

		if (!spaceId) {
			return { sections: [], userId, spaceId: null }
		}

		try {
			const space = await prisma.space.findUnique({
				where: {
					id: spaceId,
					userId,
				},
			})

			if (!space) {
				return { sections: [], userId, spaceId }
			}

			const sections = await prisma.section.findMany({
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
						select: {
							id: true,
							title: true,
							url: true,
							faviconUrl: true,
							mimeType: true,
							isGoogleDrive: true,
							position: true,
							description: true,
							sectionId: true,
						},
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
	['sections'],
	{
		revalidate: false,
		tags: ['sections'],
	},
)
