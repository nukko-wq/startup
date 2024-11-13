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
	const { sections, resources, addResource, setResources } = useResourceStore()
	const { currentSpace } = useSpaceStore()

	const handleSave = async () => {
		if (!sections.length || !currentSpace) return

		const firstSection = sections[0]
		const maxPosition = Math.max(
			0,
			...resources
				.filter((r) => r.sectionId === firstSection.id)
				.map((r) => r.position),
		)

		const tempId = `temp-${Date.now()}`
		const newResource = {
			id: tempId,
			title,
			description: '',
			url,
			faviconUrl,
			mimeType: 'text/html',
			isGoogleDrive: false,
			position: maxPosition + 1,
			sectionId: firstSection.id,
		}

		try {
			await addResource(newResource)

			const response = await fetch('/api/resources', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newResource),
			})

			if (!response.ok) {
				throw new Error('リソースの保存に失敗しました')
			}

			const savedResource = await response.json()
			setResources((prev) =>
				prev.map((resource) =>
					resource.id === tempId
						? { ...resource, id: savedResource.id }
						: resource,
				),
			)
		} catch (error) {
			console.error('Failed to save resource:', error)
			setResources((prev) => prev.filter((resource) => resource.id !== tempId))
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
