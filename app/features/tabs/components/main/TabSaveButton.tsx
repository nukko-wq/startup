'use client'

import { Bookmark } from 'lucide-react'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import { createResource } from '@/app/lib/redux/features/resource/resourceAPI'
import {
	addResource,
	replaceResource,
	removeResource,
} from '@/app/lib/redux/features/resource/resourceSlice'
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import type { RootState } from '@/app/lib/redux/store'

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
			<Button
				onPress={handleSave}
				className="outline-none p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full"
				aria-label="タブを保存"
				isDisabled={isSaving}
			>
				<Bookmark className="w-5 h-5 text-gray-700" />
			</Button>
			<Tooltip className="bg-gray-800 text-gray-300 text-xs shadow-md rounded-lg px-2 py-1">
				<OverlayArrow>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
					<svg width={8} height={8} viewBox="0 0 8 8" className="fill-gray-800">
						<path d="M0 0 L4 4 L8 0" />
					</svg>
				</OverlayArrow>
				<span>Save to space</span>
			</Tooltip>
		</TooltipTrigger>
	)
}

export default TabSaveButton
