'use client'

import ResourceEditMenu from '@/app/features/resources/edit_resource/components/ResourceEditMenu'
import ResourceDeleteButton from '@/app/features/resources/delete_resource/components/ResourceDeleteButton'
import {
	GridListItem,
	Button,
	useDragAndDrop,
	isTextDropItem,
	GridList,
	DropIndicator,
} from 'react-aria-components'
import { GripVertical } from 'lucide-react'
import { useResourceStore } from '@/app/store/resourceStore'
import ResourceIcon from '@/app/features/resources/components/ResourceIcon'
import type { Resource } from '@prisma/client'
import React from 'react'
import { useTabStore } from '@/app/store/tabStore'

interface ResourceItemProps {
	resources: {
		id: string
		title: string
		description: string | null
		url: string
		faviconUrl: string | null
		mimeType: string | null
		isGoogleDrive: boolean
		position: number
		sectionId: string
	}[]
	sectionId: string
}

export default function ResourceItem({
	resources,
	sectionId,
}: ResourceItemProps) {
	const reorderResources = useResourceStore((state) => state.reorderResources)
	const allResources = useResourceStore((state) => state.resources)
	const createResource = useResourceStore((state) => state.createResource)
	const findTabByUrl = useTabStore((state) => state.findTabByUrl)
	const switchToTab = useTabStore((state) => state.switchToTab)

	const sortedResources = React.useMemo(() => {
		const sectionResources = resources.filter((r) => r.sectionId === sectionId)
		return [...sectionResources].sort((a, b) => a.position - b.position)
	}, [resources, sectionId])

	React.useEffect(() => {
		if (resources.length > 0) {
			const sectionResources = resources.filter(
				(r) => r.sectionId === sectionId,
			)
			const sorted = [...sectionResources].sort(
				(a, b) => a.position - b.position,
			)
			if (JSON.stringify(sorted) !== JSON.stringify(sortedResources)) {
				reorderResources(sorted)
			}
		}
	}, [resources, sectionId, sortedResources, reorderResources])

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const resource = allResources.find((r) => r.id === Array.from(keys)[0])
			return [
				{
					'resource-item': JSON.stringify(resource),
					'text/plain': resource?.title || '',
				},
			]
		},
		acceptedDragTypes: ['resource-item', 'tab-item'],
		getDropOperation: () => 'move',

		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`drop-indicator ${isDropTarget ? 'active' : ''}`
					}
				/>
			)
		},

		async onInsert(e) {
			try {
				console.log('Drop Target Key:', e.target.key)
				console.log('Drop Position:', e.target.dropPosition)

				const items = await Promise.all(
					e.items.filter(isTextDropItem).map(async (item) => {
						const types = Array.from(item.types)
						if (types.includes('tab-item')) {
							const tabData = JSON.parse(await item.getText('tab-item'))

							const targetIndex = sortedResources.findIndex(
								(r) => r.id === e.target.key,
							)
							console.log('Target Index:', targetIndex)

							const newPosition =
								e.target.dropPosition === 'before'
									? targetIndex !== -1
										? sortedResources[targetIndex].position
										: 0
									: targetIndex !== -1
										? sortedResources[targetIndex].position + 1
										: sortedResources.length

							console.log('New Position:', newPosition)

							const newResource = await createResource({
								title: tabData.title,
								url: tabData.url,
								faviconUrl: tabData.faviconUrl,
								sectionId,
								position: newPosition,
							})

							return newResource
						}
						return JSON.parse(await item.getText('resource-item'))
					}),
				)

				if (items.length === 0) return

				// 新しく作成されたリソースの位置を取得
				const newResource = items[0]
				const newPosition = newResource.position
				console.log('New Position after creation:', newPosition)

				const updatedResources = allResources.map((resource) => {
					if (
						resource.sectionId === sectionId &&
						resource.position >= newPosition
					) {
						console.log(`Incrementing position for resource ID: ${resource.id}`)
						return { ...resource, position: resource.position + 1 }
					}
					return resource
				})

				// 新しいリソースを追加
				updatedResources.push(newResource)

				console.log('Updated Resources before sorting:', updatedResources)

				// 全リソースを位置順にソート
				const sortedUpdatedResources = updatedResources
					.filter((r) => r.sectionId === sectionId)
					.sort((a, b) => a.position - b.position)

				console.log('Sorted Updated Resources:', sortedUpdatedResources)

				// 位置を再割り当て
				const reassignedResources = sortedUpdatedResources.map((r, index) => ({
					...r,
					position: index + 1, // 1から開始する場合
				}))

				console.log('Reassigned Resources:', reassignedResources)

				await reorderResources(reassignedResources)
			} catch (error) {
				console.error('Failed to drop resources:', error)
			}
		},

		onReorder(e) {
			try {
				const draggedResource = allResources.find(
					(r) => r.id === Array.from(e.keys)[0],
				)
				if (!draggedResource) return

				const targetIndex = resources.findIndex((r) => r.id === e.target.key)
				const newPosition =
					e.target.dropPosition === 'before'
						? resources[targetIndex]?.position
						: resources[targetIndex]?.position + 1

				const updatedResources = allResources.map((r) => {
					if (r.id === draggedResource.id) {
						return { ...r, position: newPosition }
					}
					if (r.sectionId === sectionId && r.position >= newPosition) {
						return { ...r, position: r.position + 1 }
					}
					return r
				})

				reorderResources(updatedResources)
			} catch (error) {
				console.error('Failed to reorder resources:', error)
			}
		},

		async onRootDrop(e) {
			try {
				const items = await Promise.all(
					e.items
						.filter(isTextDropItem)
						.map(async (item) =>
							JSON.parse(await item.getText('resource-item')),
						),
				)

				const newPosition = 0

				const updatedResources = allResources.map((r) => {
					if (items.some((item) => item.id === r.id)) {
						return { ...r, sectionId, position: newPosition }
					}
					if (r.sectionId === sectionId && r.position >= newPosition) {
						return { ...r, position: r.position + 1 }
					}
					return r
				})

				await reorderResources(updatedResources)
			} catch (error) {
				console.error('Failed to drop resources:', error)
			}
		},
	})

	const handleResourceClick = async () => {
		const resource = sortedResources.find(
			(r) => r.id === document.activeElement?.getAttribute('data-key'),
		)
		if (!resource) return

		try {
			console.log('Checking for existing tab with URL:', resource.url)
			const existingTab = findTabByUrl(resource.url)

			if (existingTab) {
				console.log('Found existing tab:', existingTab)
				const success = await switchToTab(existingTab.id)
				if (success) {
					console.log('Successfully switched to existing tab')
					return
				}
				console.log('Failed to switch to existing tab, opening new tab')
			} else {
				console.log('No existing tab found, opening new tab')
			}

			window.open(resource.url, '_blank')
		} catch (error) {
			console.error('Error handling resource click:', error)
			window.open(resource.url, '_blank')
		}
	}

	return (
		<GridList
			aria-label="Resources in section"
			items={sortedResources}
			className="flex flex-col border-slate-400 rounded-md min-h-[52px] outline-none bg-white shadow-sm"
			dragAndDropHooks={dragAndDropHooks}
			renderEmptyState={() => (
				<div className="flex flex-col justify-center items-center flex-grow">
					<div className="text-gray-500">Add resources here</div>
				</div>
			)}
		>
			{(resource) => (
				<GridListItem
					textValue={resource.title}
					data-resource={JSON.stringify(resource)}
					onAction={handleResourceClick}
					className="outline-none cursor-pointer"
				>
					<div className="flex justify-between items-center p-1 border-b border-zinc-200 last:border-b-0 hover:bg-zinc-100 group">
						<div
							className="flex flex-grow p-1 ml-1 gap-2 group"
							aria-label="Resource Item Wrapper"
						>
							<div
								className="cursor-grab flex items-center opacity-0 group-hover:opacity-100"
								aria-label="Drag Wrapper"
							>
								<Button
									className="cursor-grab"
									slot="drag"
									aria-label="ドラッグハンドル"
								>
									<GripVertical className="w-4 h-4 text-zinc-500" />
								</Button>
							</div>
							<div className="flex flex-grow">
								<div className="outline-none flex flex-grow">
									<div className="flex items-end gap-2">
										<ResourceIcon
											faviconUrl={resource.faviconUrl}
											mimeType={resource.mimeType}
											isGoogleDrive={resource.isGoogleDrive}
										/>
										<div className="flex flex-col">
											<div>{resource.title}</div>
											<div className="text-xs text-muted-foreground">
												{resource.description || 'Webpage'}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="flex items-center opacity-0 group-hover:opacity-100">
							<ResourceEditMenu resource={resource} />
							<ResourceDeleteButton resource={resource} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}
