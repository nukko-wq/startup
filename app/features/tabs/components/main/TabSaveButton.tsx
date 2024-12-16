'use client'

import { Bookmark } from 'lucide-react'
import { useState } from 'react'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import { createResource } from '@/app/lib/redux/features/resource/resourceAPI'
import { addResource } from '@/app/lib/redux/features/resource/resourceSlice'
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'

interface TabSaveButtonProps {
	tab: Tab
	sectionId: string
}

const TabSaveButton = ({ tab, sectionId }: TabSaveButtonProps) => {
	const dispatch = useAppDispatch()
	const [isSaving, setIsSaving] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const handleSave = async () => {
		if (isSaving) return

		try {
			setIsSaving(true)

			// リソースの作成データを準備
			const resourceData = {
				title: tab.title,
				url: tab.url,
				sectionId: sectionId,
				faviconUrl: tab.faviconUrl || null,
			}

			// APIを呼び出してリソースを作成
			const newResource = await createResource(resourceData)

			// Reduxストアに新しいリソースを追加
			dispatch(addResource(newResource))

			// 成功通知を表示するなどの処理をここに追加できます
		} catch (error) {
			console.error('タブの保存に失敗しました:', error)
			// エラー通知を表示するなどの処理をここに追加できます
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
