'use client'

import { useResourceStore } from '@/app/store/resourceStore'
import SectionComponent from '@/app/features/sections/components/Section'
import { useEffect, useMemo } from 'react'
import { memo } from 'react'
import type { Section } from '@/app/types/section'
import type { Resource } from '@/app/types/section'
import { Button } from 'react-aria-components'
import { Plus } from 'lucide-react'

interface ResourceContentProps {
	spaceId: string
	initialSections: Section[]
	initialResources: Resource[]
}

export default memo(function ResourceContent({
	spaceId,
	initialSections,
	initialResources,
}: ResourceContentProps) {
	const sections = useResourceStore((state) => state.sections)
	const resources = useResourceStore((state) => state.resources)
	const setSections = useResourceStore((state) => state.setSections)
	const setResources = useResourceStore((state) => state.setResources)
	const createSection = useResourceStore((state) => state.createSection)
	const isLoading = useResourceStore((state) => state.isLoading)
	const isCreating = useResourceStore((state) => state.isCreating)
	const resourceCache = useResourceStore((state) => state.resourceCache)

	useEffect(() => {
		if (initialSections && initialResources) {
			setSections(initialSections)
			setResources(initialResources)
		}
	}, [initialSections, initialResources, setSections, setResources])

	const sectionResources = useMemo(() => {
		const resourceMap = new Map()
		for (const section of sections) {
			resourceMap.set(
				section.id,
				resources.filter((r) => r.sectionId === section.id),
			)
		}
		return resourceMap
	}, [sections, resources])

	const handleCreateSection = useMemo(() => {
		return () => {
			if (spaceId) {
				createSection(spaceId)
			}
		}
	}, [spaceId, createSection])

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const fetchLatestData = async () => {
			if (spaceId) {
				const cache = resourceCache.get(spaceId)
				if (cache && Date.now() - cache.timestamp > 1000) {
					// 1秒以上経過している場合
					try {
						const response = await fetch(`/api/spaces/${spaceId}/sections`)
						const data = await response.json()
						setSections(data.sections)
						setResources(data.resources)
					} catch (error) {
						console.error('Error fetching latest data:', error)
					}
				}
			}
		}

		fetchLatestData()
	}, [spaceId, resourceCache])

	return (
		<div className="flex flex-col flex-grow w-full max-w-[920px]">
			<div className="flex flex-col w-full">
				{sections.map((section) => (
					<SectionComponent
						key={section.id}
						section={section}
						resources={sectionResources.get(section.id) || []}
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
