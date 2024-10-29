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
import { useEffect } from 'react'

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

export default function ResourceItem({ resource }: ResourceItemProps) {
	// useListDataで並び替え可能なリストを管理
	const list = useListData({
		initialItems: resource,
		getKey: (item) => item.id,
	})

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		console.log('Initial list:', list.items)
	}, [])

	useEffect(() => {
		console.log('List updated:', list.items)
	}, [list.items])

	useEffect(() => {
		console.log('List updated in useEffect', list.items)
		updatePositions([...list.items])
	}, [list.items])

	// 並び順更新用の関数
	const updatePositions = async (items: typeof resource) => {
		console.log('Updating positions:', items)
		const payload: UpdatePositonPayload = {
			items: items.map((item, index) => ({
				id: item.id,
				position: index + 1,
			})),
		}

		console.log('Updated positions:', payload.items)

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
			[...keys].map((key) => ({
				'text/plain': list.getItem(key).title,
				'resource-item': JSON.stringify(list.getItem(key)),
			})),

		acceptedDragTypes: ['resource-item'],
		getDropOperation: () => 'move',

		onReorder: async (e) => {
			console.log('Before move:', list.items)

			if (e.target.dropPosition === 'before') {
				list.moveBefore(e.target.key, e.keys)
			} else if (e.target.dropPosition === 'after') {
				list.moveAfter(e.target.key, e.keys)
			}

			//const updatedItems = [...list.items]

			console.log('After move:', list.items)

			// 状態更新後に位置を更新
			// await updatePositions(updatedItems)
		},
	})

	return (
		<GridList
			aria-label="Resources"
			items={list.items}
			dragAndDropHooks={dragAndDropHooks}
			selectionMode="multiple"
			className="w-full"
		>
			{(item) => (
				<GridListItem
					className="outline-none"
					key={item.id}
					textValue={item.title}
				>
					<div className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-zinc-100">
						<div className="flex flex-grow p-1 ml-1 gap-2">
							<Button
								slot="drag"
								className="cursor-grab active:cursor-grabbing"
							>
								<GripVertical className="w-4 h-4" />
							</Button>
							<Link href={item.url} target="_blank" className="outline-none">
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
