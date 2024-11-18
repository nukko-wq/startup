'use client'

import { useResourceStore } from '@/app/store/resourceStore'
import SectionComponent from '@/app/features/sections/components/Section'
import { useEffect } from 'react'
import { Button } from 'react-aria-components'
import { Plus } from 'lucide-react'

interface ResourceContentProps {
	spaceId: string
}

export default function ResourceContent({ spaceId }: ResourceContentProps) {
	const { sections, fetchSections, createSection, isCreating, isLoading } =
		useResourceStore()

	useEffect(() => {
		if (spaceId) {
			const loadSections = async () => {
				try {
					await fetchSections(spaceId)
				} catch (error) {
					console.error('Failed to fetch sections:', error)
				}
			}
			loadSections()
		}
	}, [spaceId, fetchSections])

	return (
		<div className="flex flex-col w-full max-w-3xl mx-auto p-4">
			<div className="flex flex-col w-full">
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
			<div className="flex justify-center mt-4">
				<Button
					className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500 hover:text-gray-700 transition-colors"
					onPress={() => spaceId && createSection(spaceId)}
					isDisabled={isLoading || isCreating}
				>
					<Plus className="w-3 h-3" />
					<div>RESOURCE SECTION</div>
				</Button>
			</div>
		</div>
	)
}
