'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import SidebarMenu from '@/app/components/layouts/sidebar/SidebarMenu'
import CreateSpaceButton from '@/app/components/layouts/sidebar/CreateSpaceButton'
import SpaceButtonMenu from '@/app/components/layouts/sidebar/SpaceButtonMenu'
import type { Space } from '@/app/types/space'
import { Button } from 'react-aria-components'
import {
	GridList,
	GridListItem,
	useDragAndDrop,
	DropIndicator,
} from 'react-aria-components'
import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import { GripVertical } from 'lucide-react'

export default function Sidebar({
	initialSpaces,
	activeSpaceId,
}: {
	initialSpaces: Space[]
	activeSpaceId?: string
}) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { spaces, setSpaces, reorderSpaces } = useSpaces()
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

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const space = spaces.find((s) => s.id === Array.from(keys)[0])
			return [
				{
					'space-item': JSON.stringify(space),
					'text/plain': space?.name || '',
				},
			]
		},
		acceptedDragTypes: ['space-item'],
		getDropOperation: () => 'move',
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`sidebar-drop-indicator ${isDropTarget ? 'active' : ''}`
					}
				/>
			)
		},

		onReorder: async (e) => {
			try {
				const items = [...spaces]
				const draggedIndex = items.findIndex(
					(item) => item.id === Array.from(e.keys)[0],
				)
				const targetIndex = items.findIndex((item) => item.id === e.target.key)
				const draggedItem = items[draggedIndex]

				const newIndex =
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1

				items.splice(draggedIndex, 1)
				items.splice(
					newIndex > draggedIndex ? newIndex - 1 : newIndex,
					0,
					draggedItem,
				)

				await reorderSpaces(items)
			} catch (error) {
				console.error('Failed to reorder spaces:', error)
				alert('スペースの並び順の更新に失敗しました')
			}
		},
	})

	return (
		<div className="hidden md:flex w-[320px] bg-gray-800">
			<div className="flex-grow text-zinc-50">
				<div className="flex items-center justify-between">
					<div className="text-2xl font-bold text-zinc-50">StartUp</div>
					<SidebarMenu />
				</div>
				<CreateSpaceButton onSpaceCreated={handleSpaceCreated} />
				<GridList
					aria-label="Spaces"
					items={spaces}
					dragAndDropHooks={dragAndDropHooks}
					className="flex flex-col gap-4 py-4"
				>
					{(space) => (
						<GridListItem
							key={space.id}
							textValue={space.name}
							className="flex items-center justify-between outline-none cursor-pointer"
						>
							<div className="flex items-center w-full group">
								<div
									className="cursor-grab flex items-center opacity-0 group-hover:opacity-100"
									aria-label="Drag Wrapper"
								>
									<Button
										slot="drag"
										aria-label="ドラッグハンドル"
										className="cursor-grab p-2"
									>
										<GripVertical className="w-4 h-4 text-zinc-500" />
									</Button>
								</div>
								<Button
									onPress={() => handleSpaceClick(space.id)}
									className={`px-3 py-2 rounded hover:bg-gray-700 cursor-pointer block w-full text-left text-zinc-50 outline-none ${
										currentSpaceId === space.id ? 'bg-gray-700' : ''
									}`}
								>
									{space.name}
								</Button>
							</div>
							<SpaceButtonMenu
								spaceId={space.id}
								spaceName={space.name}
								setSpaces={setSpaces}
							/>
						</GridListItem>
					)}
				</GridList>
			</div>
		</div>
	)
}
