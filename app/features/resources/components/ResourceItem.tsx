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
import { GripVertical } from 'lucide-react'
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
	// useListDataで並び替え可能なリストを管理
	const list = useListData({
		initialItems: resources,
		getKey: (item) => item.id,
	})

	const [isDragging, setIsDragging] = useState(false)

	useEffect(() => {
		if (isDragging) {
			console.log('List updated after drag', list.items)
			updatePositions([...list.items])
			setIsDragging(false)
		}
	}, [list.items, isDragging])

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

	// ドラッグ&ドロップの設定
	const { dragAndDropHooks } = useDragAndDrop({
		// ドラッグ項目のデータを提供
		getItems: (keys) =>
			[...keys].map((key) => {
				const item = list.getItem(key)
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
			console.log('Before move:', list.items)

			if (e.target.dropPosition === 'before') {
				list.moveBefore(e.target.key, e.keys)
			} else if (e.target.dropPosition === 'after') {
				list.moveAfter(e.target.key, e.keys)
			}
			console.log('After move:', list.items)

			setIsDragging(true)
		},
	})

	return (
		<GridList
			aria-label="Resources"
			items={list.items}
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
												<span className="relative material-symbols-outlined text-[18px] -left-[1px] text-muted-foreground">
													public
												</span>
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
