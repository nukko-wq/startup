import { db } from '@/lib/db'
import { cache } from 'react'

export const getInitialSections = cache(async (userId: string) => {
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

		const sections = await db.section.findMany({
			where: {
				userId: user.id,
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

		return { sections, userId: user.id }
	} catch (error) {
		console.error('Error in getInitialSections:', error)
		throw error
	}
})
