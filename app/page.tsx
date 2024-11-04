import { redirect } from 'next/navigation'
import Sidebar from '@/app/components/layouts/sidebar/Sidebar'
import Resources from '@/app/features/resources/components/Resources'
import { getInitialSections } from '@/app/features/resources/utils/getInitialSections'
import { getSpaces } from '@/app/features/spaces/utils/getSpaces'
import { auth } from '@/lib/auth'
import type { Space } from '@/app/types/space'
import type { Section } from '@/app/types/section'
import { prisma } from '@/lib/prisma'
import Header from '@/app/features/header/Header'

// ページコンポーネントをキャッシュ化
export const revalidate = 0

interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Index({ searchParams }: PageProps) {
	const session = await auth()
	const params = await searchParams

	if (!session?.user?.id) {
		redirect('/login')
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { lastActiveSpaceId: true },
		})

		const spaceId =
			typeof params.spaceId === 'string'
				? params.spaceId
				: user?.lastActiveSpaceId || undefined

		const [initialData, spaces] = await Promise.all([
			getInitialSections(session.user.id, spaceId),
			getSpaces(session.user.id),
		])
		const sections = initialData.sections

		console.log('Page spaceId:', spaceId)

		const activeSpace = spaces.find((space) => space.id === spaceId)

		return (
			<div className="flex flex-col min-h-screen">
				<div className="flex bg-slate-50 flex-grow">
					<Sidebar initialSpaces={spaces} activeSpaceId={spaceId} />
					<main className="flex flex-col flex-grow items-center">
						<Header
							spaceName={activeSpace?.name ?? 'No Space Selected'}
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
