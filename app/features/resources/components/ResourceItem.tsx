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

interface ResourceItemProps {
	resources: Pick<
		Resource,
		| 'id'
		| 'title'
		| 'url'
		| 'faviconUrl'
		| 'mimeType'
		| 'isGoogleDrive'
		| 'position'
		| 'description'
		| 'sectionId'
	>[]
	sectionId: string
}

export default function ResourceItem({
	resources,
	sectionId,
}: ResourceItemProps) {
	const { reorderResources, resources: allResources } = useResourceStore()

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
		acceptedDragTypes: ['resource-item'],
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
				const items = await Promise.all(
					e.items
						.filter(isTextDropItem)
						.map(async (item) =>
							JSON.parse(await item.getText('resource-item')),
						),
				)

				const targetIndex = resources.findIndex((r) => r.id === e.target.key)
				const newPosition =
					e.target.dropPosition === 'before'
						? resources[targetIndex]?.position
						: resources[targetIndex]?.position + 1

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
				console.error('Failed to insert resources:', error)
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

	return (
		<GridList
			aria-label="Resources in section"
			items={sortedResources}
			className="flex flex-col border rounded-md min-h-[50px] outline-none"
			dragAndDropHooks={dragAndDropHooks}
			renderEmptyState={() => (
				<div className="p-4 text-center text-gray-500">Add resources here</div>
			)}
		>
			{(resource) => (
				<GridListItem
					textValue={resource.title}
					href={resource.url}
					target="_blank"
					className="outline-none cursor-pointer"
				>
					<div className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 group">
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
