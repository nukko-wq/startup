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
	const store = useResourceStore()

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const loadData = async () => {
			if (spaceId) {
				try {
					const data = await store.fetchSections(spaceId)
					if (data) {
						store.setSections(data.sections)
						store.setResources(data.resources)
					}
				} catch (error) {
					console.error('Failed to load sections:', error)
				}
			}
		}
		loadData()
	}, [spaceId])

	return (
		<div className="flex flex-col w-full max-w-3xl mx-auto p-4">
			<div className="flex flex-col w-full">
				{store.sections.map((section) => (
					<SectionComponent
						key={section.id}
						id={section.id}
						name={section.name}
						onDelete={store.deleteSection}
						resources={store.resources.filter(
							(r) => r.sectionId === section.id,
						)}
					/>
				))}
			</div>
			<div className="flex justify-center mt-4">
				<Button
					className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500 hover:text-gray-700 transition-colors"
					onPress={() => spaceId && store.createSection(spaceId)}
					isDisabled={store.isLoading || store.isCreating}
				>
					<Plus className="w-3 h-3" />
					<div>RESOURCE SECTION</div>
				</Button>
			</div>
		</div>
	)
}
