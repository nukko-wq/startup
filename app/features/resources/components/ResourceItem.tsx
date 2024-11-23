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

		async onInsert(e) {
			try {
				const items = await Promise.all(
					e.items.filter(isTextDropItem).map(async (item) => {
						const types = Array.from(item.types)
						if (types.includes('resource-item')) {
							const resourceData = JSON.parse(
								await item.getText('resource-item'),
							)
							return {
								...resourceData,
								sectionId: sectionId,
							}
						}
						if (types.includes('tab-item')) {
							const tabData = JSON.parse(await item.getText('tab-item'))
							return {
								title: tabData.title,
								url: tabData.url,
								faviconUrl: tabData.faviconUrl,
								sectionId: sectionId,
								description: null,
								mimeType: null,
								isGoogleDrive: false,
							}
						}
						return null
					}),
				)

				const validItems = items.filter(
					(item): item is Resource => item !== null,
				)
				if (validItems.length === 0) return

				const targetSectionResources = allResources
					.filter((r) => r.sectionId === sectionId)
					.sort((a, b) => a.position - b.position)

				const dropIndex =
					e.target.dropPosition === 'before'
						? targetSectionResources.findIndex((r) => r.id === e.target.key)
						: targetSectionResources.findIndex((r) => r.id === e.target.key) + 1

				// 他のセクションのリソースを取得
				const otherSectionResources = allResources
					.filter((r) => r.sectionId !== sectionId)
					.reduce((acc, resource) => {
						const sectionResources = acc.get(resource.sectionId) || []
						sectionResources.push(resource)
						acc.set(resource.sectionId, sectionResources)
						return acc
					}, new Map<string, typeof allResources>())

				// 新しいリソースを作成または移動
				const newResources = await Promise.all(
					validItems.map(async (item, index) => {
						if (!item.id) {
							return await createResource({
								title: item.title,
								url: item.url,
								faviconUrl: item.faviconUrl,
								sectionId: sectionId,
								position: dropIndex + index,
							})
						}
						return {
							...item,
							position: dropIndex + index,
						}
					}),
				)

				// 現在のセクションのリソースを更新
				const updatedCurrentSectionResources = [
					...targetSectionResources.slice(0, dropIndex),
					...newResources,
					...targetSectionResources.slice(dropIndex),
				].map((r, index) => ({
					...r,
					position: index,
				}))

				// 他のセクションのリソースのpositionを0から振り直す
				const updatedOtherSectionResources = Array.from(
					otherSectionResources.entries(),
				).flatMap(([_, resources]) =>
					resources
						.filter((r) => !validItems.some((item) => item.id === r.id))
						.sort((a, b) => a.position - b.position)
						.map((r, index) => ({
							...r,
							position: index,
						})),
				)

				// 全てのリソースを結合
				const finalResources = [
					...updatedCurrentSectionResources,
					...updatedOtherSectionResources,
				]

				await reorderResources(finalResources)
			} catch (error) {
				console.error('Failed to handle drop:', error)
			}
		},

		onReorder(e) {
			const draggedResource = allResources.find(
				(r) => r.id === Array.from(e.keys)[0],
			)
			if (!draggedResource) return

			const targetSectionResources = allResources
				.filter((r) => r.sectionId === sectionId)
				.sort((a, b) => a.position - b.position)

			const dropIndex =
				e.target.dropPosition === 'before'
					? targetSectionResources.findIndex((r) => r.id === e.target.key)
					: targetSectionResources.findIndex((r) => r.id === e.target.key) + 1

			// 各セクションのリソースを分離して処理
			const otherSectionResources = allResources
				.filter((r) => r.sectionId !== sectionId)
				.reduce((acc, resource) => {
					const sectionResources = acc.get(resource.sectionId) || []
					sectionResources.push(resource)
					acc.set(resource.sectionId, sectionResources)
					return acc
				}, new Map<string, typeof allResources>())

			// 現在のセクションのリソースを更新
			const updatedCurrentSectionResources = [
				...targetSectionResources.slice(0, dropIndex),
				{ ...draggedResource, sectionId },
				...targetSectionResources.slice(dropIndex),
			].map((r, index) => ({
				...r,
				position: index,
			}))

			// 他のセクションのリソースのpositionを0から振り直す
			const updatedOtherSectionResources = Array.from(
				otherSectionResources.entries(),
			).flatMap(([_, resources]) =>
				resources
					.sort((a, b) => a.position - b.position)
					.map((r, index) => ({
						...r,
						position: index,
					})),
			)

			// 全てのリソースを結合
			const finalResources = [
				...updatedCurrentSectionResources,
				...updatedOtherSectionResources,
			]

			reorderResources(finalResources).catch((error) => {
				console.error('Failed to reorder resources:', error)
			})
		},

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
	})

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
