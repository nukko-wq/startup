'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import SidebarMenu from '@/app/components/layouts/sidebar/SidebarMenu'
import CreateSpaceButton from '@/app/components/layouts/sidebar/CreateSpaceButton'
import SpaceButtonMenu from '@/app/components/layouts/sidebar/SpaceButtonMenu'
import type { Space } from '@/app/types/space'
import { Button } from 'react-aria-components'

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

	const handleSpaceClick = useCallback(
		async (spaceId: string) => {
			const params = new URLSearchParams(searchParams)
			params.set('spaceId', spaceId)
			router.push(`/?${params.toString()}`)
			await handleSpaceSelect(spaceId)
		},
		[searchParams, router],
	)

	const handleSpaceSelect = async (spaceId: string) => {
		try {
			await fetch('/api/users/last-active-space', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spaceId }),
			})
		} catch (error) {
			console.error('Error updating last active space:', error)
		}
	}

	const handleSpaceCreated = async (newSpace: Space) => {
		try {
			await handleSpaceClick(newSpace.id)
			setSpaces((prevSpaces) => [...prevSpaces, newSpace])
		} catch (error) {
			console.error('Error handling new space:', error)
		}
	}

	useEffect(() => {
		if (spaces.length > 0 && !currentSpaceId) {
			const defaultSpace = spaces[0]
			handleSpaceClick(defaultSpace.id)
		}
	}, [spaces, currentSpaceId, handleSpaceClick])

	return (
		<div className="hidden md:flex w-[320px] bg-gray-800">
			<div className="flex-grow text-zinc-50">
				<div className="flex items-center justify-between p-4">
					<div className="text-2xl font-bold text-zinc-50">StartUp</div>
					<SidebarMenu />
				</div>
				<CreateSpaceButton onSpaceCreated={handleSpaceCreated} />
				<div className="flex flex-col gap-4 py-4 pl-4">
					<div className="flex flex-col">
						<div className="text-lg mb-2 text-zinc-50">Spaces</div>
						<div className="space-y-2">
							{spaces.map((space) => (
								<div
									key={space.id}
									className="flex items-center justify-between"
								>
									<Button
										key={space.id}
										onPress={() => handleSpaceClick(space.id)}
										className={`px-3 py-2 rounded hover:bg-gray-700 cursor-pointer block w-full text-left text-zinc-50 outline-none ${
											currentSpaceId === space.id ? 'bg-gray-700' : ''
										}`}
									>
										{space.name}
									</Button>
									<SpaceButtonMenu
										spaceId={space.id}
										spaceName={space.name}
										setSpaces={setSpaces}
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
