import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { fetchInitialData } from '@/app/(dashboard)/utils/fetchInitialData'
import DashboardLayout from '@/app/(dashboard)/components/DashboardLayout'

export const dynamic = 'force-dynamic'

export default async function Home() {
	try {
		const user = await getCurrentUser()
		if (!user) {
			console.log('No user found, redirecting to login')
			return redirect('/login')
		}

		const { initialWorkspace, activeSpace } = await fetchInitialData(user.id)

		return (
			<DashboardLayout
				initialWorkspaces={initialWorkspace}
				activeSpaceId={activeSpace?.id}
			/>
		)
	} catch (error) {
		console.error('Error in Home page:', error)
		return redirect('/login')
	}
}
