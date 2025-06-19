/**
 * Ownership validation utilities
 * Ensures users can only access resources they own
 */

import { prisma } from '@/lib/prisma'

export class OwnershipError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'OwnershipError'
	}
}

/**
 * Validate that a user owns a workspace
 */
export async function validateWorkspaceOwnership(workspaceId: string, userId: string) {
	const workspace = await prisma.workspace.findFirst({
		where: {
			id: workspaceId,
			userId: userId,
		},
	})

	if (!workspace) {
		throw new OwnershipError('ワークスペースが見つからないか、アクセス権限がありません')
	}

	return workspace
}

/**
 * Validate that a user owns a space
 */
export async function validateSpaceOwnership(spaceId: string, userId: string) {
	const space = await prisma.space.findFirst({
		where: {
			id: spaceId,
			userId: userId,
		},
	})

	if (!space) {
		throw new OwnershipError('スペースが見つからないか、アクセス権限がありません')
	}

	return space
}

/**
 * Validate that a user owns a section
 */
export async function validateSectionOwnership(sectionId: string, userId: string) {
	const section = await prisma.section.findFirst({
		where: {
			id: sectionId,
			userId: userId,
		},
	})

	if (!section) {
		throw new OwnershipError('セクションが見つからないか、アクセス権限がありません')
	}

	return section
}

/**
 * Validate that a user owns a resource
 */
export async function validateResourceOwnership(resourceId: string, userId: string) {
	const resource = await prisma.resource.findFirst({
		where: {
			id: resourceId,
			userId: userId,
		},
		select: {
			id: true,
			title: true,
			url: true,
			description: true,
			faviconUrl: true,
			sectionId: true,
			order: true,
			userId: true,
			createdAt: true,
			updatedAt: true,
		},
	})

	if (!resource) {
		throw new OwnershipError('リソースが見つからないか、アクセス権限がありません')
	}

	return resource
}