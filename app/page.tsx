import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Sidebar from '@/app/features/sidebar/Sidebar'
import ResourceContent from '@/app/features/resources/components/ResourceContent'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'
import { getInitialSections } from '@/app/features/resources/utils/getInitialSections'
import { getSpaces } from '@/app/features/spaces/utils/getSpaces'
import { auth } from '@/lib/auth'
import Header from '@/app/features/header/Header'
import { getWorkspaces } from '@/app/features/workspaces/utils/getWorkspaces'
import TabListWrapper from '@/app/features/tabs/components/TabListWrapper'
import { useResourceStore } from '@/app/store/resourceStore'

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

	const [{ sections, resources, activeSpace }, spaces, workspaces] =
		await Promise.all([initialDataPromise, spacesPromise, workspacesPromise])

	// Zustandストアの初期化
	if (spaceId) {
		useResourceStore.setState({
			sections: sections || [],
			resources: resources || [],
			resourceCache: new Map([
				[
					spaceId,
					{
						sections,
						resources,
						timestamp: Date.now(),
					},
				],
			]),
		})
	} else {
		useResourceStore.setState({
			sections: sections || [],
			resources: resources || [],
			resourceCache: new Map(),
		})
	}

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
				<main className="flex flex-col flex-grow items-center bg-slate-100">
					<Header spaceName={activeSpace?.name ?? ''} spaceId={spaceId ?? ''} />
					<div className="flex flex-grow w-full">
						<div className="flex justify-center w-1/2">
							<TabListWrapper />
						</div>
						<div className="flex w-1/2 justify-center">
							<Suspense
								fallback={
									<div className="flex items-center justify-center h-full">
										<LoadingSpinner />
									</div>
								}
							>
								<ResourceContent spaceId={spaceId ?? ''} />
							</Suspense>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
