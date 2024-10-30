'use client'

import type { Resource } from '@prisma/client'
import ResourceEditMenu from '@/app/features/resources/edit_resource/components/ResourceEditMenu'
import ResourceDeleteButton from '@/app/features/resources/delete_resource/components/ResourceDeleteButton'
import {
	Link,
	GridList,
	GridListItem,
	Button,
	useDragAndDrop,
} from 'react-aria-components'
import Image from 'next/image'
import pageOutline from '@/app/public/images/page_outline_white.png'
import { useListData } from 'react-stately'
import { Earth, GripVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useResources } from '@/app/features/resources/contexts/ResourceContext'

interface ResourceItemProps {
	resource: Pick<
		Resource,
		'id' | 'title' | 'description' | 'url' | 'faviconUrl' | 'position'
	>[]
}

interface UpdatePositonPayload {
	items: {
		id: string
		position: number
	}[]
}

export default function ResourceItem() {
	const { resources, setResources } = useResources()
	const [isDragging, setIsDragging] = useState(false)

	// ドラッグ&ドロップの設定
	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) =>
			[...keys].map((key) => {
				const item = resources.find((r) => r.id === key)
				if (!item) {
					throw new Error(`Resource with key ${key} not found`)
				}
				return {
					'text/plain': item.title,
					'resource-item': JSON.stringify(item),
					faviconUrl: item.faviconUrl || '',
				}
			}),

		acceptedDragTypes: ['resource-item'],
		getDropOperation: () => 'move',
		renderDragPreview(items) {
			return (
				<div className="flex bg-zinc-300 p-2 min-w-[120px] rounded-sm">
					<div className="text-zinc-950">{items[0]['text/plain']}</div>
				</div>
			)
		},
		onReorder(e) {
			const newItems = [...resources]
			const movedItem = newItems.find((item) => item.id === [...e.keys][0])
			if (!movedItem) return
			const targetIndex = newItems.findIndex((item) => item.id === e.target.key)

			newItems.splice(
				newItems.findIndex((item) => item.id === movedItem.id),
				1,
			)
			if (e.target.dropPosition === 'before') {
				newItems.splice(targetIndex, 0, movedItem)
			} else {
				newItems.splice(targetIndex + 1, 0, movedItem)
			}

			setResources(newItems)
			setIsDragging(true)
		},
	})

	useEffect(() => {
		if (isDragging) {
			updatePositions(resources)
			setIsDragging(false)
		}
	}, [resources, isDragging])

	// 並び順更新用の関数
	const updatePositions = async (items: typeof resources) => {
		console.log('Updating positions:', items)
		const payload: UpdatePositonPayload = {
			items: items.map((item, index) => ({
				id: item.id,
				position: index + 1,
			})),
		}

		try {
			const response = await fetch('/api/resources/reorder', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})
			if (!response.ok) {
				console.error('Failed to update positions', response.statusText)
			} else {
				console.log('Positions updated successfully')
			}
		} catch (error) {
			console.error('Failed to update positions', error)
		}
	}

	return (
		<GridList
			aria-label="Resources"
			items={resources}
			dragAndDropHooks={dragAndDropHooks}
			selectionMode="single"
			className="w-full hover:cursor-pointer"
		>
			{(item) => (
				<GridListItem
					className="outline-none"
					key={item.id}
					textValue={item.title}
				>
					<div className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-zinc-100">
						<div
							className="flex flex-grow p-1 ml-1 gap-2 group"
							aria-label="Resource Item Wrapper"
						>
							<div
								className="cursor-grab flex items-center opacity-0 group-hover:opacity-100"
								aria-label="Drag Wrapper"
							>
								<Button className="cursor-grab" slot="drag" aria-label="Drag">
									<GripVertical className="w-4 h-4 text-zinc-500" />
								</Button>
							</div>
							<div className="flex flex-grow">
								<Link
									href={item.url}
									target="_blank"
									className="outline-none flex flex-grow"
								>
									<div className="flex items-end gap-2">
										{item.faviconUrl ? (
											<div className="relative w-8 h-8 p-1 top-[2px]">
												<Image
													src={pageOutline}
													width={32}
													height={32}
													alt="page_outline"
													className="absolute -left-1 -top-1 h-[32px] w-[32px]"
												/>
												<img
													src={item.faviconUrl}
													alt="Favicon"
													className="relative h-[16px] w-[16px]"
												/>
											</div>
										) : (
											<div className="relative w-8 h-8 p-1 top-[2px]">
												<Image
													src={pageOutline}
													width={32}
													height={32}
													alt="page_outline"
													className="absolute -left-1 -top-1 h-[32px] w-[32px]"
												/>
												<Earth className="w-4 h-4 text-zinc-500" />
											</div>
										)}
										<div className="flex flex-col">
											<div>{item.title}</div>
											<div className="text-xs text-muted-foreground">
												{item.description || 'Webpage'}
											</div>
										</div>
									</div>
								</Link>
							</div>
						</div>
						<div className="flex items-center">
							<ResourceEditMenu resource={item} />
							<ResourceDeleteButton resource={item} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}
