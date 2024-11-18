'use client'

import { useResourceStore } from '@/app/store/resourceStore'
import SectionComponent from '@/app/features/sections/components/Section'
import { useEffect } from 'react'

interface ResourceContentProps {
	spaceId: string
}

export default function ResourceContent({ spaceId }: ResourceContentProps) {
	const { sections, fetchSections } = useResourceStore()

	useEffect(() => {
		fetchSections(spaceId)
	}, [spaceId, fetchSections])

	return (
		<div className="w-full max-w-3xl mx-auto p-4">
			{sections.map((section) => (
				<SectionComponent
					key={section.id}
					id={section.id}
					name={section.name}
					onDelete={(sectionId) => {
						// 削除ロジック
					}}
				/>
			))}
		</div>
	)
}
