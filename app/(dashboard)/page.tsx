import { headers } from 'next/headers'
import { ReduxProvider } from '@/app/lib/redux/provider'
import Sidebar from '@/app/components/sidebar/sidebar'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { WorkspaceInitializer } from '@/app/(dashboard)/WorkspaceInitializer'
import { redirect } from 'next/navigation'
import HomeInitializer from '@/app/(dashboard)/HomeInitializer'
import Header from '@/app/components/header/Header'
import SectionListWrapper from '@/app/features/section/components/main/SectionListWrapper'
import type {
	Workspace as PrismaWorkspace,
	Space as PrismaSpace,
	Section as PrismaSection,
	Resource as PrismaResource,
} from '@prisma/client'

interface WorkspaceWithSpacesAndSections extends PrismaWorkspace {
	spaces: (PrismaSpace & {
		sections: (PrismaSection & {
			resources: PrismaResource[]
		})[]
	})[]
}

export const dynamic = 'force-dynamic'

export default async function Home() {
	try {
		const user = await getCurrentUser()

		if (!user) {
			console.log('No user found, redirecting to login')
			return redirect('/login')
		}

		const activeSpace = await prisma.space.findFirst({
			where: {
				userId: user.id,
				isLastActive: true,
			},
			select: { id: true },
		})

		let initialWorkspace: WorkspaceWithSpacesAndSections[] = []
		try {
			const defaultWorkspace = await prisma.workspace.findFirst({
				where: {
					userId: user.id,
					isDefault: true,
				},
				include: {
					spaces: {
						include: {
							sections: {
								include: {
									resources: true,
								},
							},
						},
					},
				},
			})

			if (!defaultWorkspace) {
				await prisma.workspace.create({
					data: {
						name: 'Default Workspace',
						order: 0,
						isDefault: true,
						userId: user.id,
						spaces: {
							create: [],
						},
					},
					include: {
						spaces: {
							include: {
								sections: {
									include: {
										resources: true,
									},
								},
							},
						},
					},
				})
			}

			initialWorkspace = await prisma.workspace.findMany({
				where: { userId: user.id },
				orderBy: { order: 'asc' },
				include: {
					spaces: {
						orderBy: { order: 'asc' },
						include: {
							sections: {
								orderBy: { order: 'asc' },
								include: {
									resources: {
										orderBy: { order: 'asc' },
									},
								},
							},
						},
					},
				},
			})
		} catch (dbError) {
			console.error('Database error:', dbError)
			initialWorkspace = []
		}

		return (
			<ReduxProvider>
				<WorkspaceInitializer initialWorkspaces={initialWorkspace} />
				{activeSpace && <HomeInitializer activeSpaceId={activeSpace.id} />}
				<div className="flex w-full h-full">
					<div className="flex flex-col w-full h-full">
						<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
							<Sidebar />
							<main className="flex flex-col flex-grow items-center bg-slate-100">
								<Header />
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
		console.error('Error in Home page:', error)
		return redirect('/login')
	}
}
