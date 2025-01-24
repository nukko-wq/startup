'use client'

import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'
import { X } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'

interface TabCloseButtonProps {
	tabId: number
}

const TabCloseButton = ({ tabId }: TabCloseButtonProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [isClosing, setIsClosing] = useState(false)

	const handleClose = async () => {
		if (isClosing) return

		try {
			setIsClosing(true)
			const extensionId = await tabsAPI.getExtensionId()

			if (!extensionId) {
				throw new Error('拡張機能IDが設定されていません')
			}

			// 拡張機能にタブを閉じるメッセージを送信
			chrome.runtime.sendMessage(
				extensionId,
				{ type: 'CLOSE_TAB', tabId },
				(response) => {
					if (chrome.runtime.lastError) {
						throw new Error(chrome.runtime.lastError.message)
					}
					if (!response?.success) {
						throw new Error(response?.error || 'タブの削除に失敗しました')
					}
				},
			)
		} catch (error) {
			console.error('タブの削除に失敗しました:', error)
		} finally {
			setIsClosing(false)
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
				onPress={handleClose}
				className="outline-hidden p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 group/close cursor-pointer"
				aria-label="タブを閉じる"
				isDisabled={isClosing}
			>
				<X className="w-5 h-5 text-gray-500 group-hover/close:text-gray-700" />
			</Button>
			<Tooltip className="bg-slate-800 text-slate-300 text-sm shadow-md rounded-lg px-2 py-1">
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
				Close tab
			</Tooltip>
		</TooltipTrigger>
	)
}

export default TabCloseButton
