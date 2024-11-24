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
import React, { useMemo, useCallback, memo } from 'react'
import { useTabStore } from '@/app/store/tabStore'
import type {
	DroppableCollectionInsertDropEvent,
	DroppableCollectionReorderEvent,
	DropItem,
	TextDropItem,
} from '@react-types/shared'

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

interface Resource {
	id: string
	title: string
	description: string | null
	url: string
	faviconUrl: string | null
	mimeType: string | null
	isGoogleDrive: boolean
	position: number
	sectionId: string
}

export default memo(function ResourceItem({
	resources,
	sectionId,
}: ResourceItemProps) {
	const reorderResources = useResourceStore((state) => state.reorderResources)
	const allResources = useResourceStore((state) => state.resources)
	const createResource = useResourceStore((state) => state.createResource)
	const findTabByUrl = useTabStore((state) => state.findTabByUrl)
	const switchToTab = useTabStore((state) => state.switchToTab)

	const sortedResources = useMemo(() => {
		return [...resources]
			.filter((r) => r.sectionId === sectionId)
			.sort((a, b) => a.position - b.position)
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
			if (!resource) return []
			return [
				{
					'resource-item': JSON.stringify(resource),
					'text/plain': resource.title || '',
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
		onReorder(e: DroppableCollectionReorderEvent) {
			handleReorder(e)
		},
		async onInsert(e: DroppableCollectionInsertDropEvent) {
			if (
				e.items.some(
					(item) => isTextDropItem(item) && item.types.has('tab-item'),
				)
			) {
				handleTabDrop(e)
			} else {
				handleResourceDrop(e)
			}
		},
	})

	const handleReorder = useCallback(
		(e: DroppableCollectionReorderEvent) => {
			try {
				const draggedResource = allResources.find(
					(r) => r.id === Array.from(e.keys)[0],
				)
				if (!draggedResource) return

				const sectionResources = [...allResources]
					.filter((r) => r.sectionId === sectionId)
					.sort((a, b) => a.position - b.position)

				const dropIndex =
					e.target.dropPosition === 'before'
						? sectionResources.findIndex((r) => r.id === e.target.key)
						: sectionResources.findIndex((r) => r.id === e.target.key) + 1

				const withoutDragged = sectionResources.filter(
					(r) => r.id !== draggedResource.id,
				)
				const reordered = [
					...withoutDragged.slice(0, dropIndex),
					{ ...draggedResource, sectionId },
					...withoutDragged.slice(dropIndex),
				]

				const updatedSectionResources = reordered.map((r, index) => ({
					...r,
					position: index,
				}))

				const otherResources = allResources.filter(
					(r) => r.sectionId !== sectionId,
				)
				const finalResources = [...updatedSectionResources, ...otherResources]

				reorderResources(finalResources)
			} catch (error) {
				console.error('Failed to reorder resources:', error)
			}
		},
		[allResources, sectionId, reorderResources],
	)

	const handleTabDrop = useCallback(
		async (e: DroppableCollectionInsertDropEvent) => {
			try {
				const otherSectionsResources = allResources.filter(
					(r) => r.sectionId !== sectionId,
				)

				const existingResources = allResources
					.filter((r) => r.sectionId === sectionId)
					.sort((a, b) => a.position - b.position)

				let dropIndex = 0
				if (e.target.key) {
					dropIndex =
						e.target.dropPosition === 'before'
							? existingResources.findIndex((r) => r.id === e.target.key)
							: existingResources.findIndex((r) => r.id === e.target.key) + 1
				} else {
					dropIndex = existingResources.length
				}

				const tabItems = await Promise.all(
					e.items
						.filter(isTextDropItem)
						.filter((item) => item.types.has('tab-item'))
						.map(async (item) => {
							const tabData = JSON.parse(await item.getText('tab-item'))
							return {
								title: tabData.title,
								url: tabData.url,
								faviconUrl: tabData.faviconUrl,
								sectionId,
								position: dropIndex,
							}
						}),
				)

				if (tabItems.length === 0) return

				const updatedExistingResources = [
					...existingResources
						.slice(0, dropIndex)
						.map((r, i) => ({ ...r, position: i })),
					...existingResources.slice(dropIndex).map((r, i) => ({
						...r,
						position: i + dropIndex + tabItems.length,
					})),
				]

				const tabItemsWithPosition = tabItems.map((item, i) => ({
					...item,
					position: dropIndex + i,
				}))

				const createdResources = await Promise.all(
					tabItemsWithPosition.map((item) => createResource(item)),
				)

				const finalResources = [
					...updatedExistingResources,
					...createdResources,
					...otherSectionsResources,
				]

				await reorderResources(finalResources)
			} catch (error) {
				console.error('Failed to handle tab drop:', error)
				reorderResources(allResources)
			}
		},
		[allResources, sectionId, createResource, reorderResources],
	)

	const handleResourceDrop = useCallback(
		async (e: DroppableCollectionInsertDropEvent) => {
			try {
				const resourceItems = await Promise.all(
					e.items
						.filter(isTextDropItem)
						.filter((item) => item.types.has('resource-item'))
						.map(async (item) => {
							const resourceData = JSON.parse(
								await item.getText('resource-item'),
							)
							return resourceData
						}),
				)

				if (resourceItems.length === 0) return

				const targetSectionResources = allResources
					.filter((r) => r.sectionId === sectionId)
					.sort((a, b) => a.position - b.position)

				const originalSectionId = resourceItems[0].sectionId
				const originalSectionResources = allResources
					.filter((r) => r.sectionId === originalSectionId)
					.sort((a, b) => a.position - b.position)

				const dropIndex =
					e.target.dropPosition === 'before'
						? targetSectionResources.findIndex((r) => r.id === e.target.key)
						: targetSectionResources.findIndex((r) => r.id === e.target.key) + 1

				const updatedTargetResources = [
					...targetSectionResources.slice(0, dropIndex),
					...resourceItems.map((item) => ({ ...item, sectionId })),
					...targetSectionResources.slice(dropIndex),
				].map((r, index) => ({
					...r,
					position: index,
				}))

				const updatedOriginalResources = originalSectionResources
					.filter((r) => !resourceItems.some((item) => item.id === r.id))
					.map((r, index) => ({
						...r,
						position: index,
					}))

				const otherSectionResources = allResources.filter(
					(r) => r.sectionId !== sectionId && r.sectionId !== originalSectionId,
				)

				const finalResources = [
					...updatedTargetResources,
					...updatedOriginalResources,
					...otherSectionResources,
				]

				reorderResources(finalResources)
			} catch (error) {
				console.error('Failed to handle resource drop:', error)
				reorderResources(allResources)
			}
		},
		[allResources, sectionId, reorderResources],
	)

	const handleResourceClick = useCallback(
		async (resource: Resource) => {
			try {
				const existingTab = findTabByUrl(resource.url)
				if (existingTab) {
					const success = await switchToTab(existingTab.id)
					if (success) return
				}
				window.open(resource.url, '_blank')
			} catch (error) {
				console.error('Error handling resource click:', error)
				window.open(resource.url, '_blank')
			}
		},
		[findTabByUrl, switchToTab],
	)

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
					key={resource.id}
					textValue={resource.title}
					data-resource={JSON.stringify(resource)}
					onAction={() => handleResourceClick(resource)}
					className="outline-none cursor-pointer"
				>
					<div className="grid grid-cols-[32px_1fr_74px] items-center p-1 border-b border-zinc-200 last:border-b-0 hover:bg-zinc-100 group">
						<div
							className="cursor-grab flex items-center opacity-0 group-hover:opacity-100 p-2"
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
						<div className="flex items-end gap-2 truncate">
							<ResourceIcon
								faviconUrl={resource.faviconUrl}
								mimeType={resource.mimeType}
								isGoogleDrive={resource.isGoogleDrive}
							/>
							<div className="flex flex-col truncate">
								<span className="truncate">{resource.title}</span>
								<span className="text-xs text-muted-foreground">
									{resource.description || 'Webpage'}
								</span>
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
})
