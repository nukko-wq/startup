'use client'

import { useResourceStore } from '@/app/store/resourceStore'
import SectionComponent from '@/app/features/sections/components/Section'
import { useEffect, useCallback, useMemo } from 'react'
import { Button } from 'react-aria-components'
import { Plus } from 'lucide-react'
import { memo } from 'react'

interface ResourceContentProps {
	spaceId: string
}

export default memo(function ResourceContent({
	spaceId,
}: ResourceContentProps) {
	const sections = useResourceStore((state) => state.sections)
	const resources = useResourceStore((state) => state.resources)
	const fetchSections = useResourceStore((state) => state.fetchSections)
	const setSections = useResourceStore((state) => state.setSections)
	const setResources = useResourceStore((state) => state.setResources)
	const isLoading = useResourceStore((state) => state.isLoading)
	const isCreating = useResourceStore((state) => state.isCreating)
	const deleteSection = useResourceStore((state) => state.deleteSection)
	const createSection = useResourceStore((state) => state.createSection)

	const handleCreateSection = useMemo(() => {
		return () => {
			if (spaceId) {
				createSection(spaceId)
			}
		}
	}, [spaceId, createSection])

	useEffect(() => {
		const loadData = async () => {
			if (spaceId) {
				try {
					const data = await fetchSections(spaceId)
					if (data) {
						setSections(data.sections)
						setResources(data.resources)
					}
				} catch (error) {
					console.error('Failed to load sections:', error)
				}
			}
		}
		loadData()
	}, [spaceId, fetchSections, setSections, setResources])

	return (
		<div className="flex flex-col flex-grow w-full max-w-[920px]">
			<div className="flex flex-col w-full">
				{sections.map((section) => (
					<SectionComponent
						key={section.id}
						id={section.id}
						name={section.name}
						onDelete={deleteSection}
						resources={resources.filter((r) => r.sectionId === section.id)}
					/>
				))}
			</div>
			<div className="flex justify-center mt-4">
				<Button
					className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500 hover:text-gray-700 transition-colors"
					onPress={handleCreateSection}
					isDisabled={isLoading || isCreating}
				>
					<Plus className="w-3 h-3" />
					<div>RESOURCE SECTION</div>
				</Button>
			</div>
		</div>
	)
})
