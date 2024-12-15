// localhost:3000/space/[spaceId]/page.tsx

import { ReduxProvider } from '@/app/lib/redux/provider'
import Sidebar from '@/app/components/sidebar/sidebar'
import SectionListWrapper from '@/app/features/section/components/main/SectionListWrapper'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import { WorkspaceInitializer } from '@/app/(dashboard)/WorkspaceInitializer'
import SpaceInitializer from '@/app/features/space/components/SpaceInitializer'
import type {
	Workspace as PrismaWorkspace,
	Space as PrismaSpace,
	Section as PrismaSection,
} from '@prisma/client'
import Header from '@/app/components/header/Header'

interface WorkspaceWithSpacesAndSections extends PrismaWorkspace {
	spaces: (PrismaSpace & {
		sections: PrismaSection[]
	})[]
}

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

		// スペースの存在確認を追加
		const spaceExists = await prisma.space.findUnique({
			where: { id: spaceId },
		})

		if (!spaceExists) {
			notFound()
		}

		// 現在のスペースをアクティブに設定
		await prisma.space.update({
			where: { id: spaceId },
			data: { isLastActive: true },
		})

		// 他のスペースのisLastActiveをfalseに設定
		await prisma.space.updateMany({
			where: {
				AND: [{ id: { not: spaceId } }, { userId: user.id }],
			},
			data: { isLastActive: false },
		})

		// ワークスペースとスペースのデータを取得
		const workspaces: WorkspaceWithSpacesAndSections[] =
			await prisma.workspace.findMany({
				where: { userId: user.id },
				orderBy: { order: 'asc' },
				include: {
					spaces: {
						orderBy: { order: 'asc' },
						include: {
							sections: {
								orderBy: { order: 'asc' },
								where: {
									spaceId: spaceId, // 現在のスペースのセクションのみを取得
								},
							},
						},
					},
				},
			})

		return (
			<ReduxProvider>
				<WorkspaceInitializer initialWorkspaces={workspaces} />
				<SpaceInitializer spaceId={spaceId} />
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
		console.error('Error in SpacePage:', error)
		return redirect('/login')
	}
}
