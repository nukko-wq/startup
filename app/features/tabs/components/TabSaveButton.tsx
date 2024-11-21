import { Bookmark } from 'lucide-react'
import React, { useState } from 'react'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import { useResourceStore } from '@/app/store/resourceStore'
import { useSpaceStore } from '@/app/store/spaceStore'

interface TabSaveButtonProps {
	title: string
	url: string
	faviconUrl: string
}

const TabSaveButton = ({ title, url, faviconUrl }: TabSaveButtonProps) => {
	const sections = useResourceStore((state) => state.sections)
	const resources = useResourceStore((state) => state.resources)
	const createSection = useResourceStore((state) => state.createSection)
	const currentSpace = useSpaceStore((state) => state.currentSpace)
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)

	const handleSave = async () => {
		if (!currentSpace) return

		try {
			let targetSectionId: string

			// セクションが存在しない場合、新しいセクションを作成
			if (!sections.length) {
				const newSection = await createSection(currentSpace.id)
				targetSectionId = newSection.id
			} else {
				targetSectionId = sections[0].id
			}

			const maxPosition = Math.max(
				0,
				...resources
					.filter((r) => r.sectionId === targetSectionId)
					.map((r) => r.position),
			)

			const newResource = {
				title,
				description: '',
				url,
				faviconUrl,
				mimeType: 'text/html',
				isGoogleDrive: false,
				position: maxPosition + 1,
				sectionId: targetSectionId,
			}

			// 即座にUIを更新
			const optimisticResource = {
				...newResource,
				id: `temp-${Date.now()}`, // 一時的なID
			}
			useResourceStore.setState((state) => ({
				resources: [...state.resources, optimisticResource],
			}))

			// APIリクエストを非同期で実行
			const response = await fetch('/api/resources', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newResource),
				credentials: 'include',
			})

			if (!response.ok) {
				throw new Error('リソースの保存に失敗しました')
			}

			const savedResource = await response.json()

			// 一時的なリソースを実際のリソースで置き換え
			useResourceStore.setState((state) => ({
				resources: state.resources.map((r) =>
					r.id === optimisticResource.id ? savedResource : r,
				),
			}))

			// キャッシュの更新
			const resourceStore = useResourceStore.getState()
			const cache = resourceStore.resourceCache.get(currentSpace.id)
			if (cache) {
				resourceStore.resourceCache.set(currentSpace.id, {
					...cache,
					resources: [...cache.resources, savedResource],
					timestamp: Date.now(),
				})
			}
		} catch (error) {
			// エラー時は一時的なリソースを削除
			useResourceStore.setState((state) => ({
				resources: state.resources.filter((r) => r.id !== `temp-${Date.now()}`),
			}))
			console.error('Failed to save resource:', error)
			alert('リソースの保存に失敗しました')
		}
	}

	return (
		<TooltipTrigger
			isOpen={isTooltipVisible}
			onOpenChange={setIsTooltipVisible}
			delay={700}
			closeDelay={0}
		>
			<Button
				onPress={handleSave}
				className="outline-none p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full"
			>
				<Bookmark className="w-5 h-5 text-gray-700" />
			</Button>
			<Tooltip className="bg-gray-800 text-gray-300 text-sm shadow-md rounded-lg px-2 py-1">
				<OverlayArrow>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
					<svg width={8} height={8} viewBox="0 0 8 8" className="fill-gray-800">
						<path d="M0 0 L4 4 L8 0" />
					</svg>
				</OverlayArrow>
				Save to space
			</Tooltip>
		</TooltipTrigger>
	)
}

export default TabSaveButton
