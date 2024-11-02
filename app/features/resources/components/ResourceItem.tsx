'use client'

import type { Resource } from '@prisma/client'
import ResourceEditMenu from '@/app/features/resources/edit_resource/components/ResourceEditMenu'
import ResourceDeleteButton from '@/app/features/resources/delete_resource/components/ResourceDeleteButton'
import {
	Link,
	GridListItem,
	Button,
	useDragAndDrop,
	isTextDropItem,
	GridList,
	DropIndicator,
} from 'react-aria-components'
import { GripVertical } from 'lucide-react'
import { useResources } from '@/app/features/resources/contexts/ResourceContext'
import ResourceIcon from '@/app/features/resources/components/ResourceIcon'

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
	const { reorderResources, resources: allResources } = useResources()

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

		// ドロップを受け入れる形式を指定
		acceptedDragTypes: ['resource-item'],
		getDropOperation: () => 'move',

		// ドロップ位置のインジケーターをレンダリング
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

		// アイテムの並び替えを処理
		async onReorder(e) {
			try {
				const draggedResource = allResources.find(
					(r) => r.id === Array.from(e.keys)[0],
				)
				if (!draggedResource) return

				const targetIndex = resources.findIndex((r) => r.id === e.target.key)
				const newPosition =
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1

				const updatedResources = allResources.map((r) => {
					if (r.id === draggedResource.id) {
						return { ...r, sectionId, position: newPosition }
					}
					if (r.sectionId === sectionId) {
						const pos = r.position >= newPosition ? r.position + 1 : r.position
						return { ...r, position: pos }
					}
					return r
				})

				await reorderResources(updatedResources)
			} catch (error) {
				console.error('Failed to reorder resources:', error)
			}
		},
	})

	return (
		<GridList
			aria-label="Resources in section"
			items={resources}
			className="flex flex-col border rounded-md"
			dragAndDropHooks={dragAndDropHooks}
			renderEmptyState={() => ''}
		>
			{(resource) => (
				<GridListItem textValue={resource.title} className="outline-none">
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
									href={resource.url}
									target="_blank"
									className="outline-none flex flex-grow"
								>
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
								</Link>
							</div>
						</div>
						<div className="flex items-center">
							<ResourceEditMenu resource={resource} />
							<ResourceDeleteButton resource={resource} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}
