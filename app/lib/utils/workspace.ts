import type { Workspace } from '@prisma/client'
import type { Workspace as WorkspaceState } from '@/app/lib/redux/features/workspace/types/workspace'

export function serializeWorkspace(workspace: Workspace): WorkspaceState {
	return {
		id: workspace.id,
		name: workspace.name,
		order: workspace.order,
		isDefault: workspace.isDefault,
		userId: workspace.userId,
	}
}
