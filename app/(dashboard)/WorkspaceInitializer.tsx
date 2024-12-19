'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { setWorkspaces } from '@/app/lib/redux/features/workspace/workspaceSlice'
import {
	setSpaces,
	setActiveSpace,
} from '@/app/lib/redux/features/space/spaceSlice'
import { setSections } from '@/app/lib/redux/features/section/sectionSlice'
import { setResources } from '@/app/lib/redux/features/resource/resourceSlice'
import { serializeWorkspace } from '@/app/lib/utils/workspace'
import { serializeSpace } from '@/app/lib/utils/space'
import { serializeSection } from '@/app/lib/utils/section'
import { serializeResource } from '@/app/lib/utils/resource'
import type { WorkspaceWithSpacesAndSections } from './types'

interface Props {
	initialWorkspaces: WorkspaceWithSpacesAndSections[]
	activeSpaceId?: string
}

export function WorkspaceInitializer({
	initialWorkspaces,
	activeSpaceId,
}: Props) {
	const dispatch = useAppDispatch()

	useEffect(() => {
		// Workspaceの初期化
		const serializedWorkspaces = initialWorkspaces.map(serializeWorkspace)
		dispatch(setWorkspaces(serializedWorkspaces))

		// Spaceの初期化
		const allSpaces = initialWorkspaces.flatMap((workspace) =>
			workspace.spaces.map((space) => ({
				...serializeSpace(space),
				workspaceId: workspace.id, // workspaceIdを明示的に設定
			})),
		)
		dispatch(setSpaces(allSpaces))

		// セクションの初期化
		const allSections = initialWorkspaces.flatMap((workspace) =>
			workspace.spaces.flatMap((space) =>
				space.sections.map((section) => ({
					...serializeSection(section),
					spaceId: space.id, // spaceIdを明示的に設定
				})),
			),
		)
		dispatch(setSections(allSections))

		// リソースの初期化
		const allResources = initialWorkspaces.flatMap((workspace) =>
			workspace.spaces.flatMap((space) =>
				space.sections.flatMap((section) =>
					section.resources.map((resource) => ({
						...serializeResource(resource),
						sectionId: section.id, // sectionIdを明示的に設定
					})),
				),
			),
		)
		dispatch(setResources(allResources))

		// activeSpaceの設定
		if (activeSpaceId) {
			dispatch(setActiveSpace(activeSpaceId))
		}
	}, [dispatch, initialWorkspaces, activeSpaceId])

	return null
}
