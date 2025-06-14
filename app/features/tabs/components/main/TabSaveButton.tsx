'use client'

import { createResource } from '@/app/lib/redux/features/resource/resourceAPI'
import {
	addResource,
	removeResource,
	replaceResource,
} from '@/app/lib/redux/features/resource/resourceSlice'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import type { RootState } from '@/app/lib/redux/store'
import { Bookmark } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'

interface TabSaveButtonProps {
	tab: Tab
	sectionId: string
}

const TabSaveButton = ({ tab, sectionId }: TabSaveButtonProps) => {
	const dispatch = useAppDispatch()
	const [isSaving, setIsSaving] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const resources = useAppSelector(
		(state: RootState) => state.resource.resources,
	)

	const handleSave = async () => {
		if (isSaving) return

		const maxOrder = Math.max(...resources.map((r) => r.order), -1)

		const tempResource: Resource = {
			id: `temp-${Date.now()}`,
			title: tab.title,
			url: tab.url,
			faviconUrl: tab.faviconUrl || null,
			description: null,
			sectionId: sectionId,
			userId: '',
			order: maxOrder + 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		try {
			setIsSaving(true)

			dispatch(addResource(tempResource))

			const resourceData = {
				title: tab.title,
				url: tab.url,
				sectionId: sectionId,
				faviconUrl: tab.faviconUrl || null,
			}

			const newResource = await createResource(resourceData)

			dispatch(
				replaceResource({
					oldId: tempResource.id,
					newResource: newResource,
				}),
			)
		} catch (error) {
			console.error('タブの保存に失敗しました:', error)
			dispatch(removeResource(tempResource.id))
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<TooltipTrigger
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			delay={700}
			closeDelay={0}
		>
			<div
				onMouseDown={(e) => e.stopPropagation()}
				onPointerDown={(e) => e.stopPropagation()}
				className="inline-block"
			>
				<Button
					onPress={handleSave}
					className="outline-hidden p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full group/bookmark cursor-pointer"
					aria-label="タブを保存"
					isDisabled={isSaving}
				>
					<Bookmark className="w-5 h-5 text-gray-500 group-hover/bookmark:text-gray-700" />
				</Button>
			</div>
			<Tooltip className="bg-slate-800 text-slate-300 text-xs shadow-md rounded-lg px-2 py-1">
				<OverlayArrow>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
					<svg
						width={8}
						height={8}
						viewBox="0 0 8 8"
						className="fill-slate-800"
					>
						<path d="M0 0 L4 4 L8 0" />
					</svg>
				</OverlayArrow>
				<span>スペースに保存</span>
			</Tooltip>
		</TooltipTrigger>
	)
}

export default TabSaveButton
