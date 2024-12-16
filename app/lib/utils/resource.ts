import type { Resource as PrismaResource } from '@prisma/client'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'

export const serializeResource = (prismaResource: PrismaResource): Resource => {
	return {
		id: prismaResource.id,
		title: prismaResource.title,
		url: prismaResource.url,
		faviconUrl: prismaResource.faviconUrl,
		description: prismaResource.description,
		sectionId: prismaResource.sectionId,
		userId: prismaResource.userId,
		order: prismaResource.order,
		createdAt: prismaResource.createdAt.toISOString(),
		updatedAt: prismaResource.updatedAt.toISOString(),
	}
}
