'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import type { Workspace } from '@prisma/client'
import { serializeWorkspace } from '@/app/lib/utils/workspace'

export function WorkspaceInitializer({
	initialWorkspaces,
}: {
	initialWorkspaces: Workspace[]
}) {
	const dispatch = useDispatch()

	useEffect(() => {
		const serializedWorkspaces = initialWorkspaces.map(serializeWorkspace)
		dispatch(setWorkspaces(serializedWorkspaces))
	}, [dispatch, initialWorkspaces])

	return null
}
