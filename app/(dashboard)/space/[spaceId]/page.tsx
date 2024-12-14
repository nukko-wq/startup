// localhost:3000/space/[spaceId]/page.tsx

import { ReduxProvider } from '@/app/lib/redux/provider'
import Sidebar from '@/app/components/sidebar/sidebar'
import SectionListWrapper from '@/app/features/section/components/main/SectionListWrapper'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import { WorkspaceInitializer } from '@/app/(dashboard)/WorkspaceInitializer'

export const dynamic = 'force-dynamic'

export default async function SpacePage() {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return redirect('/login')
		}

		// ワークスペースとスペースのデータを取得
		const workspaces = await prisma.workspace.findMany({
			where: { userId: user.id },
			orderBy: { order: 'asc' },
			include: {
				spaces: {
					orderBy: { order: 'asc' },
				},
			},
		})

		return (
			<ReduxProvider>
				<WorkspaceInitializer initialWorkspaces={workspaces} />
				<div className="flex w-full h-full">
					<div className="flex flex-col w-full h-full">
						<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
							<Sidebar />
							<main className="flex flex-col flex-grow items-center bg-slate-100">
								<div className="flex flex-grow w-full h-[calc(100vh-68px)]">
									<div className="flex justify-center w-1/2">Tab List</div>
									<div className="flex justify-center w-1/2">
										<SectionListWrapper />
									</div>
								</div>
							</main>
						</div>
					</div>
				</div>
			</ReduxProvider>
		)
	} catch (error) {
		console.error('Error in SpacePage:', error)
		return redirect('/login')
	}
}
