import { db } from '@/lib/db'
import type { Space } from '@/app/types/space'

export async function getSpaces(userId: string): Promise<Space[]> {
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
			userId: true,
		},
	})

	return spaces
}
