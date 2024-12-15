'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { setSpaces } from '@/app/lib/redux/features/space/spaceSlice'
import { setSections } from '@/app/lib/redux/features/section/sectionSlice'
import type {
	Workspace as PrismaWorkspace,
	Space as PrismaSpace,
	Section as PrismaSection,
} from '@prisma/client'
import { serializeWorkspace } from '@/app/lib/utils/workspace'
import { serializeSpace } from '@/app/lib/utils/space'
import { serializeSection } from '@/app/lib/utils/section'

// Prisma Workspaceの型を拡張
interface WorkspaceWithSpacesAndSections extends PrismaWorkspace {
	spaces: (PrismaSpace & {
		sections: PrismaSection[]
	})[]
}

export function WorkspaceInitializer({
	initialWorkspaces,
}: {
	initialWorkspaces: WorkspaceWithSpacesAndSections[]
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

		// セクションの初期化
		const allSections = initialWorkspaces.flatMap((workspace) =>
			workspace.spaces.flatMap((space) =>
				space.sections.map((section) => serializeSection(section)),
			),
		)
		dispatch(setSections(allSections))
	}, [dispatch, initialWorkspaces])

	return null
}
