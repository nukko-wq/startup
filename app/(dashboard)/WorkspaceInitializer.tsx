'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import type { Workspace as ReduxWorkspace } from '@/app/lib/redux/features/workspace/types/workspace'
import type { Workspace as PrismaWorkspace } from '@prisma/client'
import { serializeWorkspace } from '@/app/lib/utils/workspace'

export function WorkspaceInitializer({
	initialWorkspaces,
}: {
	initialWorkspaces: PrismaWorkspace[]
}) {
	const dispatch = useDispatch()

	useEffect(() => {
		const serializedWorkspaces = initialWorkspaces.map(serializeWorkspace)
		dispatch(setWorkspaces(serializedWorkspaces))
	}, [dispatch, initialWorkspaces])

	return null
}
