'use client'

import { GripVertical } from 'lucide-react'
import type { DraggableProvided } from '@hello-pangea/dnd'
import ResourceIcon from '@/app/components/elements/ResourceIcon'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import ResourceDeleteButton from '@/app/features/resource/components/main/ResourceDeleteButton'
import ResourceMenu from '@/app/features/resource/components/main/ResourceMenu'
import { useAppSelector } from '@/app/lib/redux/hooks'

interface ResourceItemProps {
	resource: Resource
	provided: DraggableProvided
}

const ResourceItem = ({ resource, provided }: ResourceItemProps) => {
	const tabs = useAppSelector((state) => state.tabs.tabs)

	const handleResourceClick = async (resource: Resource) => {
		try {
			const existingTab = tabs.find((tab) => tab.url === resource.url)

			if (existingTab) {
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
							window.open(resource.url, '_blank')
						}
					},
				)
			} else {
				window.open(resource.url, '_blank')
			}
		} catch (error) {
			console.error('リソースを開く際にエラーが発生しました:', error)
			window.open(resource.url, '_blank')
		}
	}

	const getResourceDescription = (resource: Resource): string => {
		if (resource.description) return resource.description

		const url = new URL(resource.url)
		const hostname = url.hostname
		const pathname = url.pathname

		if (hostname === 'mail.google.com') return 'Gmail'
		if (hostname === 'drive.google.com') return 'Google Drive'
		if (hostname === 'github.com') return 'GitHub'

		if (hostname === 'docs.google.com') {
			if (pathname.startsWith('/forms/')) return 'Google Form'
			if (pathname.startsWith('/spreadsheets/')) return 'Google Sheet'
			if (pathname.startsWith('/document/')) return 'Google Doc'
		}

		return 'Webpage'
	}

	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			className="flex flex-grow flex-col cursor-pointer group/item"
			onClick={(e) => {
				if ((e.target as HTMLElement).closest('.resource-edit-form')) {
					return
				}
				handleResourceClick(resource)
			}}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					handleResourceClick(resource)
				}
			}}
		>
			<div className="grid grid-cols-[32px_1fr_74px] items-center px-1 pt-1 pb-2 border-b border-slate-200 last:border-b-0 hover:bg-gray-100">
				<div className="flex items-center p-2 opacity-0 group-hover/item:opacity-100">
					<div className="cursor-grab">
						<GripVertical className="w-4 h-4 text-slate-500" />
					</div>
				</div>
				<div className="flex items-end gap-2 truncate cursor-pointer">
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

export default ResourceItem
