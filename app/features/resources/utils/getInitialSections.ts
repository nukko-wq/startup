import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function getInitialSections() {
	const user = await getCurrentUser()

	if (!user) {
		redirect('/login')
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
}
