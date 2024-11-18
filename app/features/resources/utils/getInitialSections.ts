import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { ReadonlyURLSearchParams } from 'next/navigation'
import type { Section } from '@/app/types/section'
import type { Space } from '@/app/types/space'

interface InitialSectionsResult {
	sections: Section[]
	resources: Array<{
		id: string
		title: string
		url: string
		faviconUrl: string | null
		mimeType: string | null
		isGoogleDrive: boolean
		position: number
		description: string | null
		sectionId: string
	}>
	userId: string
	spaceId: string | null
	activeSpace: Space | null
}

export const getInitialSections = unstable_cache(
	async (
		userId: string,
		searchParams: ReadonlyURLSearchParams | { spaceId?: string },
	): Promise<InitialSectionsResult> => {
		try {
			// まず、アクティブなスペースを探す
			const activeSpace = await prisma.space.findFirst({
				where: {
					userId,
					isLastActive: true,
				},
			})

			const spaceId =
				searchParams instanceof ReadonlyURLSearchParams
					? searchParams.get('spaceId')
					: searchParams.spaceId

			// URLにspaceIdがない場合は、アクティブなスペースのIDを使用
			const targetSpaceId = spaceId || activeSpace?.id

			if (!targetSpaceId) {
				return {
					sections: [],
					resources: [],
					userId,
					spaceId: null,
					activeSpace: null,
				}
			}

			const sections = await prisma.section.findMany({
				where: {
					userId: userId,
					spaceId: targetSpaceId,
				},
				include: {
					resources: {
						select: {
							id: true,
							title: true,
							url: true,
							faviconUrl: true,
							mimeType: true,
							isGoogleDrive: true,
							position: true,
							description: true,
							sectionId: true,
						},
						orderBy: {
							position: 'asc',
						},
					},
				},
				orderBy: {
					order: 'asc',
				},
			})

			// sectionsの取得後、resourcesを抽出して返す
			const allResources = sections.flatMap((section) => section.resources)

			return {
				sections,
				resources: allResources,
				userId,
				spaceId: targetSpaceId,
				activeSpace: activeSpace || null,
			}
		} catch (error) {
			console.error('Error in getInitialSections:', error)
			throw error
		}
	},
	['sections'],
	{
		revalidate: false,
		tags: ['sections'],
	},
)
