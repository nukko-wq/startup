import type {
	Workspace as PrismaWorkspace,
	Space as PrismaSpace,
	Section as PrismaSection,
	Resource as PrismaResource,
} from '@prisma/client'

export interface WorkspaceWithSpacesAndSections extends PrismaWorkspace {
	spaces: (PrismaSpace & {
		sections: (PrismaSection & {
			resources: PrismaResource[]
		})[]
	})[]
}
