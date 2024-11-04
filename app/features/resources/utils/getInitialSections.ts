import { db } from '@/lib/db'
import { cache } from 'react'

export const getInitialSections = cache(
	async (userId: string, spaceId?: string) => {
		console.log('getInitialSections called with userId:', userId)

		if (!userId) {
			throw new Error('ユーザーIDが必要です')
		}

		try {
			const user = await db.user.findUnique({
				where: { id: userId },
			})

			console.log('Found user:', user)

			if (!user) {
				throw new Error('ユーザーが見つかりません')
			}

			let defaultSpace = spaceId
				? await db.space.findUnique({
						where: { id: spaceId },
					})
				: await db.space.findFirst({
						where: { userId: user.id },
					})

			if (!defaultSpace) {
				defaultSpace = await db.space.create({
					data: {
						name: 'My Space',
						order: 1,
						userId: user.id,
					},
				})
			}

			const sections = await db.section.findMany({
				where: {
					userId: user.id,
					spaceId: defaultSpace.id,
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

			if (sections.length === 0) {
				const defaultSection = await db.section.create({
					data: {
						name: 'Resources',
						order: 1,
						userId: user.id,
						spaceId: defaultSpace.id,
					},
					select: {
						id: true,
						name: true,
						order: true,
						createdAt: true,
						resources: true,
					},
				})
				sections.push(defaultSection)
			}

			return { sections, userId: user.id, spaceId: defaultSpace.id }
		} catch (error) {
			console.error('Error in getInitialSections:', error)
			throw error
		}
	},
)
