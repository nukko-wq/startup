'use client'

import { useAppSelector } from '@/app/lib/redux/hooks'
import { selectSortedResourcesBySectionId } from '@/app/lib/redux/features/resource/selector'
import { GripVertical } from 'lucide-react'
import ResourceIcon from '@/app/components/elements/ResourceIcon'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import ResourceDeleteButton from '@/app/features/resource/components/main/ResourceDeleteButton'
import ResourceMenu from '@/app/features/resource/components/main/ResourceMenu'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import {
	reorderResources,
	moveResource,
} from '@/app/lib/redux/features/resource/resourceSlice'
import { useEffect } from 'react'

interface ResourceListProps {
	sectionId: string
}

const ResourceItem = ({ resource }: { resource: Resource }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: resource.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	const tabs = useAppSelector((state) => state.tabs.tabs)

	const handleResourceClick = async (resource: Resource) => {
		try {
			// 既存のタブを探す
			const existingTab = tabs.find((tab) => tab.url === resource.url)

			if (existingTab) {
				// タブが見つかった場合は、そのタブに切り替える
				const response = await fetch('/api/extension/id')
				const { extensionIds } = await response.json()
				const extensionId = extensionIds[0]

				if (!extensionId || !window.chrome?.runtime) {
					throw new Error('拡張機能が見つかりません')
				}

				window.chrome.runtime.sendMessage(
					extensionId,
					{ type: 'SWITCH_TO_TAB', tabId: existingTab.id },
					(response) => {
						if (!response?.success) {
							// タブの切り替えに失敗した場合は新しいタブで開く
							window.open(resource.url, '_blank')
						}
					},
				)
			} else {
				// タブが見つからない場合は新しいタブで開く
				window.open(resource.url, '_blank')
			}
		} catch (error) {
			console.error('リソースを開く際にエラーが発生しました:', error)
			// エラーが発生した場合は新しいタブで開く
			window.open(resource.url, '_blank')
		}
	}

	const getResourceDescription = (resource: Resource): string => {
		if (resource.description) return resource.description

		const url = new URL(resource.url)
		const hostname = url.hostname
		const pathname = url.pathname

		if (hostname === 'mail.google.com') {
			return 'Gmail'
		}
		if (hostname === 'drive.google.com') {
			return 'Google Drive'
		}
		if (hostname === 'github.com') {
			return 'GitHub'
		}

		if (hostname === 'docs.google.com') {
			if (pathname.startsWith('/forms/')) {
				return 'Google Form'
			}
			if (pathname.startsWith('/spreadsheets/')) {
				return 'Google Sheet'
			}
			if (pathname.startsWith('/document/')) {
				return 'Google Doc'
			}
		}

		return 'Webpage'
	}

	const handleClick = async () => {
		await handleResourceClick(resource)
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="flex flex-grow flex-col group/item cursor-grab"
		>
			<div className="grid grid-cols-[32px_1fr_74px] items-center px-1 pt-1 pb-2 border-b border-slate-200 last:border-b-0 hover:bg-gray-100">
				<div className="flex items-center p-2 opacity-0 group-hover/item:opacity-100">
					<div className="cursor-grab">
						<GripVertical className="w-4 h-4 text-slate-500" />
					</div>
				</div>
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div className="flex items-end gap-2 truncate" onClick={handleClick}>
					<ResourceIcon faviconUrl={resource.faviconUrl} url={resource.url} />
					<div className="flex flex-col truncate">
						<span className="truncate">{resource.title}</span>
						<span className="text-xs text-gray-400">
							{getResourceDescription(resource)}
						</span>
					</div>
				</div>
				<div className="flex items-center opacity-0 group-hover/item:opacity-100">
					<ResourceMenu resource={resource} />
					<ResourceDeleteButton resourceId={resource.id} />
				</div>
			</div>
		</div>
	)
}

const ResourceList = ({ sectionId }: ResourceListProps) => {
	const resources = useAppSelector((state) =>
		selectSortedResourcesBySectionId(state, sectionId),
	)
	const dispatch = useAppDispatch()

	useEffect(() => {
		const handleDragEnd = (event: CustomEvent) => {
			const { active, over, isDropOnSection } = event.detail
			if (!over) return

			const activeResource = resources.find((r) => r.id === active.id)
			if (!activeResource) return

			const overId = String(over.id)

			if (isDropOnSection) {
				// セクションへのドロップ
				if (overId !== sectionId) {
					dispatch(
						moveResource({
							resourceId: String(active.id),
							fromSectionId: sectionId,
							toSectionId: overId,
							newIndex: 0,
						}),
					)
				}
			} else {
				// リソースへのドロップ
				const overResource = resources.find((r) => r.id === overId)

				if (overResource) {
					if (overResource.sectionId === sectionId) {
						// 同じセクション内での移動
						dispatch(
							reorderResources({
								sectionId,
								oldIndex: resources.findIndex((r) => r.id === active.id),
								newIndex: resources.findIndex((r) => r.id === over.id),
							}),
						)
					} else {
						// 別のセクションのリソースへのドロップ
						dispatch(
							moveResource({
								resourceId: String(active.id),
								fromSectionId: sectionId,
								toSectionId: overResource.sectionId,
								newIndex: resources.findIndex((r) => r.id === over.id),
							}),
						)
					}
				}
			}
		}

		document.addEventListener('resourceDragEnd', handleDragEnd as EventListener)
		return () => {
			document.removeEventListener(
				'resourceDragEnd',
				handleDragEnd as EventListener,
			)
		}
	}, [dispatch, resources, sectionId])

	return (
		<div className="flex flex-col justify-center border-slate-400 rounded-md outline-none bg-white shadow-sm">
			<SortableContext
				items={resources.map((r) => r.id)}
				strategy={verticalListSortingStrategy}
			>
				{resources.map((resource) => (
					<ResourceItem key={resource.id} resource={resource} />
				))}
			</SortableContext>
		</div>
	)
}

export default ResourceList
