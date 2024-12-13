'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { setSpaces } from '@/app/lib/redux/features/space/spaceSlice'
import type {
	Workspace as PrismaWorkspace,
	Space as PrismaSpace,
} from '@prisma/client'
import { serializeWorkspace } from '@/app/lib/utils/workspace'
import { serializeSpace } from '@/app/lib/utils/space'

// Prisma Workspaceの型を拡張
interface WorkspaceWithSpaces extends PrismaWorkspace {
	spaces: PrismaSpace[]
}

export function WorkspaceInitializer({
	initialWorkspaces,
}: {
	initialWorkspaces: WorkspaceWithSpaces[]
}) {
	const dispatch = useDispatch()

	useEffect(() => {
		// Workspaceの初期化
		const serializedWorkspaces = initialWorkspaces.map(serializeWorkspace)
		dispatch(setWorkspaces(serializedWorkspaces))

		// Spaceの初期化
		const allSpaces = initialWorkspaces.flatMap((workspace) =>
			workspace.spaces.map((space) => serializeSpace(space)),
		)
		dispatch(setSpaces(allSpaces))
	}, [dispatch, initialWorkspaces])

	return null
}
