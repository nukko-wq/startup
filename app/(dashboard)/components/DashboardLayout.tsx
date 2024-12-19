'use client'

import { useEffect, useState } from 'react'
import { ReduxProvider } from '@/app/lib/redux/provider'
import { WorkspaceInitializer } from '@/app/(dashboard)/WorkspaceInitializer'
import HomeInitializer from '@/app/(dashboard)/HomeInitializer'
import DashboardContent from '@/app/(dashboard)/components/DashboardContent'
import type { WorkspaceWithSpacesAndSections } from '@/app/(dashboard)/types'

interface Props {
	initialWorkspaces: WorkspaceWithSpacesAndSections[]
	activeSpaceId?: string
}

export default function DashboardLayout({
	initialWorkspaces,
	activeSpaceId,
}: Props) {
	const [isRootPath, setIsRootPath] = useState(false)

	useEffect(() => {
		setIsRootPath(window.location.pathname === '/')
	}, [])

	return (
		<ReduxProvider>
			<WorkspaceInitializer
				initialWorkspaces={initialWorkspaces}
				activeSpaceId={activeSpaceId}
			/>
			{isRootPath && activeSpaceId && (
				<HomeInitializer activeSpaceId={activeSpaceId} />
			)}
			<DashboardContent />
		</ReduxProvider>
	)
}
