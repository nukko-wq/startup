import { redirect } from 'next/navigation'
import Sidebar from '@/app/features/sidebar/Sidebar'
import Resources from '@/app/features/resources/components/Resources'
import { getInitialSections } from '@/app/features/resources/utils/getInitialSections'
import { getSpaces } from '@/app/features/spaces/utils/getSpaces'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Header from '@/app/features/header/Header'
import { getWorkspaces } from '@/app/features/workspaces/utils/getWorkspaces'

export const revalidate = 0

interface PageProps {
	params: Promise<{ [key: string]: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Index({ searchParams }: PageProps) {
	const session = await auth()
	const resolvedSearchParams = await searchParams

	if (!session?.user?.id) {
		redirect('/login')
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { lastActiveSpaceId: true },
		})

		const spaceIdFromParams = resolvedSearchParams?.spaceId
		const spaceId =
			typeof spaceIdFromParams === 'string'
				? spaceIdFromParams
				: user?.lastActiveSpaceId || undefined

		const [initialData, spaces, workspaces] = await Promise.all([
			getInitialSections(session.user.id, spaceId),
			getSpaces(session.user.id),
			getWorkspaces(session.user.id),
		])

		const sections = initialData.sections
		const activeSpace = spaces.find((space) => space.id === spaceId)

		return (
			<div className="flex flex-col min-h-screen">
				<div className="flex bg-slate-50 flex-grow">
					<Sidebar
						initialWorkspaces={workspaces}
						initialSpaces={spaces}
						initialActiveSpaceId={spaceId}
					/>
					<main className="flex flex-col flex-grow items-center">
						<Header
							spaceName={activeSpace?.name ?? ''}
							spaceId={spaceId ?? ''}
						/>
						<Resources
							initialData={{
								sections,
								userId: session.user.id,
								spaceId: spaceId ?? '',
							}}
							spaceId={spaceId ?? ''}
						/>
					</main>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error in Index page:', error)
		if (
			error instanceof Error &&
			error.message === 'ユーザーが見つかりません'
		) {
			redirect('/login')
		}
		throw error
	}
}
