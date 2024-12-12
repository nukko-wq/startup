import type { Workspace as PrismaWorkspace } from '@prisma/client'
import type { Workspace as ReduxWorkspace } from '@/app/lib/redux/features/workspace/types/workspace'

export function serializeWorkspace(workspace: PrismaWorkspace): ReduxWorkspace {
	return {
		id: workspace.id,
		name: workspace.name,
		order: workspace.order,
		isDefault: workspace.isDefault,
		userId: workspace.userId,
	}
}
