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
	params: { [key: string]: string }
	searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Index({ searchParams }: PageProps) {
	const session = await auth()
	if (!session?.user?.id) {
		redirect('/login')
	}

	const resolvedSearchParams = await searchParams
	const spaceId = resolvedSearchParams.spaceId?.toString()

	const initialDataPromise = getInitialSections(session.user.id, {
		spaceId,
	})
	const spacesPromise = getSpaces(session.user.id)
	const workspacesPromise = getWorkspaces(session.user.id)

	const [{ sections, activeSpace }, spaces, workspaces] = await Promise.all([
		initialDataPromise,
		spacesPromise,
		workspacesPromise,
	])

	return (
		<div className="flex flex-col min-h-screen">
			<div className="flex bg-slate-50 flex-grow">
				<Sidebar
					initialWorkspaces={workspaces}
					initialSpaces={spaces}
					initialActiveSpaceId={spaceId || undefined}
				/>
				<main className="flex flex-col flex-grow items-center">
					<Header spaceName={activeSpace?.name ?? ''} spaceId={spaceId ?? ''} />
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
}
