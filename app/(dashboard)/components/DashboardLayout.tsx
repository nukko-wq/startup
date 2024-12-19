'use client'

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
	return (
		<ReduxProvider>
			<WorkspaceInitializer initialWorkspaces={initialWorkspaces} />
			{activeSpaceId && <HomeInitializer activeSpaceId={activeSpaceId} />}
			<DashboardContent />
		</ReduxProvider>
	)
}
