import { prisma } from '@/lib/prisma'
import type { WorkspaceWithSpacesAndSections } from '../types'

interface InitialData {
	initialWorkspace: WorkspaceWithSpacesAndSections[]
	activeSpace: { id: string } | null
}

export async function fetchInitialData(userId: string): Promise<InitialData> {
	const activeSpace = await prisma.space.findFirst({
		where: {
			userId,
			isLastActive: true,
		},
		select: { id: true },
	})

	let initialWorkspace: WorkspaceWithSpacesAndSections[] = []
	try {
		const defaultWorkspace = await prisma.workspace.findFirst({
			where: {
				userId,
				isDefault: true,
			},
			include: {
				spaces: {
					include: {
						sections: {
							include: {
								resources: true,
							},
						},
					},
				},
			},
		})

		if (!defaultWorkspace) {
			await prisma.workspace.create({
				data: {
					name: 'Default Workspace',
					order: 0,
					isDefault: true,
					userId,
					spaces: {
						create: [],
					},
				},
			})
		}

		initialWorkspace = await prisma.workspace.findMany({
			where: { userId },
			orderBy: { order: 'asc' },
			include: {
				spaces: {
					orderBy: { order: 'asc' },
					include: {
						sections: {
							orderBy: { order: 'asc' },
							include: {
								resources: {
									orderBy: { order: 'asc' },
								},
							},
						},
					},
				},
			},
		})
	} catch (dbError) {
		console.error('Database error:', dbError)
		initialWorkspace = []
	}

	return {
		initialWorkspace,
		activeSpace,
	}
}
