import Link from 'next/link'
import { auth } from '@/lib/auth'
import SidebarMenu from '@/app/components/layouts/sidebar/sidebar-menu'
import { getSpaces } from '@/app/features/spaces/utils/getSpaces'
import CreateSpaceButton from '@/app/components/layouts/sidebar/create-space-button'

export default async function Sidebar({
	activeSpaceId,
}: { activeSpaceId?: string }) {
	const session = await auth()
	const spaces = session?.user?.id ? await getSpaces(session.user.id) : []

	return (
		<div className="hidden md:flex w-[320px] bg-gray-800">
			<div className="flex-grow text-zinc-50">
				<div className="flex items-center justify-between p-4">
					<div className="text-2xl font-bold">StartUp</div>
					<SidebarMenu />
				</div>
				<CreateSpaceButton />
				<div className="flex flex-col gap-4 p-4">
					<div>
						<div className="text-lg mb-2">Spaces</div>
						<div className="space-y-2">
							{spaces.map((space) => (
								<Link
									key={space.id}
									href={`/?spaceId=${space.id}`}
									className={`px-3 py-2 rounded hover:bg-gray-700 cursor-pointer block text-white ${
										activeSpaceId === space.id ? 'bg-gray-700' : ''
									}`}
								>
									{space.name}
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
