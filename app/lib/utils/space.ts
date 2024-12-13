import type { Space } from '@prisma/client'
import type { Space as SerializedSpace } from '@/app/lib/redux/features/space/types/space'

export const serializeSpace = (space: Space): SerializedSpace => {
	return {
		id: space.id,
		name: space.name,
		order: space.order,
		workspaceId: space.workspaceId,
		isLastActive: space.isLastActive,
		isDefault: space.isDefault,
	}
}
