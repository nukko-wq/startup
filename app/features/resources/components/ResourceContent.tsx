'use client'

import { useResourceStore } from '@/app/store/resourceStore'
import SectionComponent from '@/app/features/sections/components/Section'
import { useEffect, useMemo } from 'react'
import { memo } from 'react'
import type { Section } from '@/app/types/section'
import type { Resource } from '@/app/types/section'

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

	return (
		<div className="flex flex-col flex-grow w-full max-w-[920px]">
			{sections.map((section) => (
				<SectionComponent
					key={section.id}
					section={section}
					resources={sectionResources.get(section.id) || []}
				/>
			))}
		</div>
	)
})
