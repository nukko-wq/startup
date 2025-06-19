// app/lib/utils/section.ts
import type { Section as PrismaSection } from '@prisma/client'
import type { Section } from '@/app/lib/redux/features/section/types/section'

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
