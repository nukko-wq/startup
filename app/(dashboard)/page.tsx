import { ReduxProvider } from '@/app/lib/redux/provider'
import Sidebar from '@/app/components/sidebar/sidebar'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { WorkspaceInitializer } from '@/app/(dashboard)/WorkspaceInitializer'
import { redirect } from 'next/navigation'
import type { Workspace as PrismaWorkspace } from '@prisma/client'

export default async function Home() {
	try {
		const user = await getCurrentUser()

		if (!user) {
			console.log('No user found, redirecting to login')
			return redirect('/login')
		}

		let initialWorkspace: PrismaWorkspace[] = []
		try {
			initialWorkspace = await db.workspace.findMany({
				where: { userId: user.id },
				orderBy: { order: 'asc' },
				include: {
					spaces: {
						orderBy: { order: 'asc' },
					},
				},
			})

			console.log('Initial workspaces:', initialWorkspace)
		} catch (dbError) {
			console.error('Database error:', dbError)
			initialWorkspace = []
		}

		return (
			<ReduxProvider>
				<WorkspaceInitializer initialWorkspaces={initialWorkspace} />
				<div className="flex w-full h-full">
					<div className="flex flex-col w-full h-full">
						<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
							<Sidebar />
							<main className="flex flex-col flex-grow items-center bg-slate-100">
								<div className="flex flex-grow w-full h-[calc(100vh-68px)]">
									<div className="flex justify-center w-1/2">Tab List</div>
									<div className="flex justify-center w-1/2">Section List</div>
								</div>
							</main>
						</div>
					</div>
				</div>
			</ReduxProvider>
		)
	} catch (error) {
		console.error(
			'Error in Home page:',
			error instanceof Error ? error.message : error,
		)
		return redirect('/login')
	}
}
