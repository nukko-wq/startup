'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import SidebarMenu from '@/app/components/layouts/sidebar/SidebarMenu'
import CreateSpaceButton from '@/app/components/layouts/sidebar/CreateSpaceButton'
import DeleteSpaceButton from '@/app/components/layouts/sidebar/DeleteSpaceButton'
import type { Space } from '@/app/types/space'

export default function Sidebar({
	initialSpaces,
	activeSpaceId,
}: {
	initialSpaces: Space[]
	activeSpaceId?: string
}) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [spaces, setSpaces] = useState<Space[]>(initialSpaces)
	const currentSpaceId = searchParams.get('spaceId') || activeSpaceId

	const handleSpaceClick = async (spaceId: string) => {
		const params = new URLSearchParams(searchParams)
		params.set('spaceId', spaceId)
		router.push(`/?${params.toString()}`)
	}

	return (
		<div className="hidden md:flex w-[320px] bg-gray-800">
			<div className="flex-grow text-zinc-50">
				<div className="flex items-center justify-between p-4">
					<div className="text-2xl font-bold">StartUp</div>
					<SidebarMenu />
				</div>
				<CreateSpaceButton setSpaces={setSpaces} />
				<div className="flex flex-col gap-4 p-4">
					<div>
						<div className="text-lg mb-2">Spaces</div>
						<div className="space-y-2">
							{spaces.map((space) => (
								<div
									key={space.id}
									className="flex items-center justify-between"
								>
									<button
										key={space.id}
										type="button"
										onClick={() => handleSpaceClick(space.id)}
										className={`px-3 py-2 rounded hover:bg-gray-700 cursor-pointer block w-full text-left text-white ${
											currentSpaceId === space.id ? 'bg-gray-700' : ''
										}`}
									>
										{space.name}
									</button>
									<DeleteSpaceButton spaceId={space.id} setSpaces={setSpaces} />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
