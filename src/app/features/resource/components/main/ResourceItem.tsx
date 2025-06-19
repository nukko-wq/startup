'use client'

import ResourceIcon from '@/app/components/elements/ResourceIcon'
import ResourceDeleteButton from '@/app/features/resource/components/main/ResourceDeleteButton'
import ResourceMenu from '@/app/features/resource/components/main/ResourceMenu'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'
import { useAppSelector } from '@/app/lib/redux/hooks'
import type { DraggableProvided } from '@hello-pangea/dnd'
import { GripVertical } from 'lucide-react'

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
				// 既存タブに切り替える
				try {
					await tabsAPI.switchToTab(existingTab.id)
				} catch (error) {
					// 拡張機能経由でのタブ切り替えに失敗した場合のフォールバック
					console.warn('拡張機能経由でのタブ切り替えに失敗しました:', error)
					window.open(resource.url, '_blank')
				}
			} else {
				// 新規タブを一番右側に開く
				try {
					await tabsAPI.openTabAtEnd(resource.url)
				} catch (error) {
					// 拡張機能が利用できない場合のフォールバック
					console.warn('拡張機能経由でのタブ作成に失敗しました:', error)
					window.open(resource.url, '_blank')
				}
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
			className="group/item flex grow cursor-pointer flex-col"
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
			<div className="grid grid-cols-[32px_1fr_74px] items-center border-slate-200 border-b px-1 pt-1 pb-2 last:border-b-0 hover:bg-gray-100">
				<div className="flex items-center p-2 opacity-0 group-hover/item:opacity-100">
					<div className="cursor-grab">
						<GripVertical className="h-4 w-4 text-slate-500" />
					</div>
				</div>
				<div className="flex cursor-pointer items-end gap-2 truncate">
					<ResourceIcon faviconUrl={resource.faviconUrl} url={resource.url} />
					<div className="flex flex-col truncate">
						<span className="truncate text-sm">{resource.title}</span>
						<span className="text-gray-400 text-xs">
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
