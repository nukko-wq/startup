// localhost:3000/space/[spaceId]/page.tsx

import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { fetchSpaceData } from '@/app/(dashboard)/utils/fetchInitialData'
import DashboardLayout from '@/app/(dashboard)/components/DashboardLayout'

export const dynamic = 'force-dynamic'

export default async function SpacePage({
	params,
}: {
	params: Promise<{ spaceId: string }>
}) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return redirect('/login')
		}

		const resolvedParams = await params
		const spaceId = resolvedParams.spaceId

		try {
			const { initialWorkspace } = await fetchSpaceData(user.id, spaceId)

			return (
				<DashboardLayout
					initialWorkspaces={initialWorkspace}
					activeSpaceId={spaceId}
				/>
			)
		} catch (error) {
			if ((error as Error).message === 'Space not found') {
				return notFound()
			}
			throw error
		}
	} catch (error) {
		console.error('Error in SpacePage:', error)
		return redirect('/login')
	}
}
