// app/lib/redux/features/section/types/section.ts
import type { Section as PrismaSection } from '@prisma/client'

export interface Section {
	id: string
	name: string
	order: number
	spaceId: string
	userId: string
	createdAt: string
	updatedAt: string
}

export const serializeSection = (section: PrismaSection): Section => {
	return {
		id: section.id,
		name: section.name,
		order: section.order,
		spaceId: section.spaceId,
		userId: section.userId,
		createdAt: section.createdAt.toISOString(),
		updatedAt: section.updatedAt.toISOString(),
	}
}
