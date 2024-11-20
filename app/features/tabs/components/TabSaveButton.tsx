import { Bookmark } from 'lucide-react'
import React from 'react'
import { Button } from 'react-aria-components'
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
			useResourceStore.setState((state) => ({
				resources: [...state.resources, savedResource],
			}))
		} catch (error) {
			console.error('Failed to save resource:', error)
			alert('リソースの保存に失敗しました')
		}
	}

	return (
		<Button
			onPress={handleSave}
			className="outline-none p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full"
		>
			<Bookmark className="w-5 h-5 text-gray-700" />
		</Button>
	)
}

export default TabSaveButton
