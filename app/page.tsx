import { redirect } from 'next/navigation'
import Sidebar from '@/app/features/sidebar/Sidebar'
import Resources from '@/app/features/resources/components/Resources'
import { getInitialSections } from '@/app/features/resources/utils/getInitialSections'
import { getSpaces } from '@/app/features/spaces/utils/getSpaces'
import { auth } from '@/lib/auth'
import Header from '@/app/features/header/Header'
import { getWorkspaces } from '@/app/features/workspaces/utils/getWorkspaces'
import TabList from '@/app/features/tabs/components/TabList'

export const revalidate = 0

type PageProps = {
	params: Promise<{ [key: string]: string }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
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

	// activeSpaceがある場合、そのスペースにリダイレクト
	if (activeSpace && !spaceId) {
		redirect(`/?spaceId=${activeSpace.id}`)
	}

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
					<div className="flex flex-grow w-full">
						<div className="w-1/2">
							<TabList />
						</div>
						<div className="flex w-1/2">
							<Resources
								initialData={{
									sections,
									userId: session.user.id,
									spaceId: spaceId ?? '',
								}}
								spaceId={spaceId ?? ''}
							/>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
