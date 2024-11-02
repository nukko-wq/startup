'use client'

import type { Resource } from '@prisma/client'
import ResourceEditMenu from '@/app/features/resources/edit_resource/components/ResourceEditMenu'
import ResourceDeleteButton from '@/app/features/resources/delete_resource/components/ResourceDeleteButton'
import { Link, GridList, GridListItem, Button } from 'react-aria-components'
import { useDrag } from 'react-aria'
import { GripVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useResources } from '@/app/features/resources/contexts/ResourceContext'
import ResourceIcon from '@/app/features/resources/components/ResourceIcon'

interface UpdatePositonPayload {
	items: {
		id: string
		position: number
	}[]
}

interface ResourceItemProps {
	resource: Pick<
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
	>
}

export default function ResourceItem({ resource }: ResourceItemProps) {
	const { resources, setResources, reorderResources } = useResources()
	const [isDragging, setIsDragging] = useState(false)

	const { dragProps, dragButtonProps } = useDrag({
		getItems() {
			return [
				{
					'text/plain': resource.title,
					'resource-item': JSON.stringify(resource),
				},
			]
		},
		onDragStart() {
			setIsDragging(true)
		},
		onDragEnd(e) {
			setIsDragging(false)
			if (e.dropOperation === 'move') {
				const currentResource = resources.find((r) => r.id === resource.id)
				if (!currentResource) return

				if (currentResource.sectionId === resource.sectionId) {
					return
				}

				const updatedResources = resources.map((r) => {
					if (r.id === resource.id) {
						return {
							...r,
							sectionId: resource.sectionId,
						}
					}
					return r
				})

				reorderResources(updatedResources).catch(console.error)
			}
		},
		getAllowedDropOperations: () => ['move'],
	})

	return (
		<GridList
			aria-label="Resources"
			items={[resource]}
			className="w-full hover:cursor-pointer"
			style={{
				opacity: isDragging ? 0.5 : 1,
			}}
		>
			{(item) => (
				<GridListItem
					className="outline-none"
					key={item.id}
					textValue={item.title}
				>
					<div
						{...dragProps}
						className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-zinc-100"
					>
						<div
							className="flex flex-grow p-1 ml-1 gap-2 group"
							aria-label="Resource Item Wrapper"
						>
							<div
								className="cursor-grab flex items-center opacity-0 group-hover:opacity-100"
								aria-label="Drag Wrapper"
							>
								<Button
									{...dragButtonProps}
									className="cursor-grab"
									slot="drag"
									aria-label="Drag"
								>
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
										<ResourceIcon
											faviconUrl={item.faviconUrl}
											mimeType={item.mimeType}
											isGoogleDrive={item.isGoogleDrive}
										/>
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
