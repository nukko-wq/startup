'use client'

import { useState } from 'react'
import { ResourceProvider } from '@/app/features/resources/contexts/ResourceContext'
import { Button } from 'react-aria-components'
import Section from '@/app/features/sections/components/Section'
import type { getInitialSections } from '@/app/features/resources/utils/getInitialSections'

interface ResourceProps {
	initialData: Awaited<ReturnType<typeof getInitialSections>>
}

const Resources = ({
	initialData,
}: { initialData: Awaited<ReturnType<typeof getInitialSections>> }) => {
	const [sections, setSections] = useState(initialData.sections)
	const [isCreating, setIsCreating] = useState(false)

	const handleSectionDelete = (sectionId: string) => {
		setSections((prev) => prev.filter((section) => section.id !== sectionId))
	}

	const handleCreateSection = async () => {
		if (isCreating) return
		setIsCreating(true)

		try {
			const response = await fetch('/api/sections', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'Resources',
					order: sections.length,
				}),
				credentials: 'include',
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to create section')
			}

			const newSection = await response.json()
			setSections((prev) => [...prev, { ...newSection, resources: [] }])
		} catch (error) {
			console.error('Section creation error:', error)
			if (error instanceof Error && error.message.includes('認証')) {
				window.location.href = '/login'
				return
			}
			alert('セクションの作成に失敗しました')
		} finally {
			setIsCreating(false)
		}
	}

	return (
		<ResourceProvider initialResources={sections.flatMap((s) => s.resources)}>
			<div className="flex flex-col w-full">
				<div className="flex flex-col w-full items-center">
					{sections.map((section) => (
						<Section
							key={section.id}
							id={section.id}
							name={section.name}
							onDelete={handleSectionDelete}
						/>
					))}
				</div>
				<div className="flex justify-center">
					<div className="flex justify-center">
						<Button
							className="flex items-center gap-2 px-4 py-2"
							onPress={handleCreateSection}
							isDisabled={isCreating}
						>
							+ RESOURCE SECTION
						</Button>
					</div>
				</div>
			</div>
		</ResourceProvider>
	)
}

export default Resources
