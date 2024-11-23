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
				const items = await Promise.all(
					e.items.filter(isTextDropItem).map(async (item) => {
						const types = Array.from(item.types)
						if (types.includes('resource-item')) {
							return JSON.parse(await item.getText('resource-item'))
						}
						return null
					}),
				)

				const validItems = items.filter(
					(item): item is Resource => item !== null,
				)
				if (validItems.length === 0) return

				// ドロップ先のセクションのリソースを取得
				const targetSectionResources = allResources
					.filter((r) => r.sectionId === sectionId)
					.sort((a, b) => a.position - b.position)

				// ドロップ位置の計算
				let dropIndex = targetSectionResources.length // デフォルトは最後
				if (e.target) {
					const targetIndex = targetSectionResources.findIndex(
						(r) => r.id === e.target.key,
					)
					if (targetIndex !== -1) {
						dropIndex =
							e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1
					}
				}

				// 元のセクションのリソースを更新
				const originalSectionIds = new Set(
					validItems.map((item) => item.sectionId),
				)
				const originalSectionResources = allResources
					.filter((r) => originalSectionIds.has(r.sectionId))
					.filter((r) => !validItems.some((item) => item.id === r.id))
					.map((r, index) => ({
						...r,
						position: index,
					}))

				// ドロップ先のセクションのリソースを更新
				const updatedTargetResources = [
					...targetSectionResources.slice(0, dropIndex),
					...validItems.map((item) => ({
						...item,
						sectionId: sectionId,
					})),
					...targetSectionResources.slice(dropIndex),
				].map((r, index) => ({
					...r,
					position: index,
				}))

				// 他のセクションのリソースを取得
				const otherSectionResources = allResources.filter(
					(r) =>
						!originalSectionIds.has(r.sectionId) && r.sectionId !== sectionId,
				)

				// 全てのリソースを結合
				const finalResources = [
					...otherSectionResources,
					...originalSectionResources,
					...updatedTargetResources,
				]

				await reorderResources(finalResources)
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

				const targetIndex = sortedResources.findIndex(
					(r) => r.id === e.target.key,
				)
				if (targetIndex === -1) return

				// 新しい配列を作成し、ドラッグされたアイテムを除外
				const updatedResources = sortedResources
					.filter((r) => r.id !== draggedResource.id)
					.map((r) => ({ ...r }))

				// ドロップ位置を計算
				const dropIndex =
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1

				// ドラッグされたアイテムを新しい位置に挿入
				updatedResources.splice(dropIndex, 0, { ...draggedResource })

				// positionを0から順番に振り直し
				const reorderedResources = updatedResources.map((r, index) => ({
					...r,
					position: index,
				}))

				reorderResources(reorderedResources)
			} catch (error) {
				console.error('Failed to reorder resources:', error)
			}
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
