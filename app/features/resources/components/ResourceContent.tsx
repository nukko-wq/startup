'use client'

import { useResourceStore } from '@/app/store/resourceStore'
import SectionComponent from '@/app/features/sections/components/Section'
import { useEffect, useCallback, useMemo } from 'react'
import { memo } from 'react'

interface ResourceContentProps {
	spaceId: string
}

export default memo(function ResourceContent({
	spaceId,
}: ResourceContentProps) {
	const sections = useResourceStore((state) => state.sections)
	const resources = useResourceStore((state) => state.resources)
	const isLoading = useResourceStore((state) => state.isLoading)

	// セクションごとのリソースをメモ化
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
