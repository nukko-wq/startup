'use client'

import { useEffect } from 'react'
import {
	Button,
	GridList,
	GridListItem,
	useDragAndDrop,
} from 'react-aria-components'
import SectionComponent from '@/app/features/sections/components/Section'
import type { Section } from '@/app/types/section'
import { Plus } from 'lucide-react'
import { useSpaceStore } from '@/app/store/spaceStore'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'
import { useResourceStore } from '@/app/store/resourceStore'

interface ResourceProps {
	initialData: { sections: Section[]; userId: string; spaceId: string }
	spaceId: string
}

const Resources = ({ initialData, spaceId }: ResourceProps) => {
	const {
		isLoading: isSpaceLoading,
		activeSpaceId,
		isNavigating,
	} = useSpaceStore()

	const {
		sections,
		resources,
		isLoading,
		isCreating,
		setSections,
		setResources,
		fetchSections,
		createSection,
		deleteSection,
		reorderSections,
	} = useResourceStore()

	// 初期データのセット
	useEffect(() => {
		setSections(initialData.sections)
		const initialResources = initialData.sections.flatMap(
			(section) =>
				section.resources?.map((resource) => ({
					id: resource.id,
					title: resource.title,
					url: resource.url,
					faviconUrl: resource.faviconUrl,
					mimeType: resource.mimeType,
					isGoogleDrive: resource.isGoogleDrive,
					position: resource.position,
					description: resource.description,
					sectionId: section.id,
				})) ?? [],
		)
		setResources(initialResources)
	}, [initialData, setSections, setResources])

	// スペース切り替え時のデータ再取得
	useEffect(() => {
		if (!isNavigating && spaceId) {
			fetchSections(spaceId)
		}
	}, [spaceId, isNavigating, fetchSections])

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) => {
			const section = sections.find((s) => s.id === Array.from(keys)[0])
			return [
				{
					'section-item': JSON.stringify(section),
					'text/plain': section?.name || '',
				},
			]
		},
		acceptedDragTypes: ['section-item'],
		getDropOperation: () => 'move',

		onReorder: async (e) => {
			const items = [...sections]
			const draggedIndex = items.findIndex(
				(item) => item.id === Array.from(e.keys)[0],
			)
			const targetIndex = items.findIndex((item) => item.id === e.target.key)
			const draggedItem = items[draggedIndex]

			items.splice(draggedIndex, 1)
			items.splice(
				e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1,
				0,
				draggedItem,
			)

			await reorderSections(items)
		},
	})

	if (
		isSpaceLoading ||
		isLoading ||
		!spaceId ||
		spaceId !== activeSpaceId ||
		isNavigating
	) {
		return <LoadingSpinner />
	}

	return (
		<div className="flex flex-col flex-grow w-full justify-center">
			<div className="flex flex-col w-full outline-none">
				<div className="flex flex-col w-full items-center">
					<GridList
						aria-label="Draggable sections"
						items={sections}
						dragAndDropHooks={dragAndDropHooks}
						className="w-full outline-none"
					>
						{(section) => (
							<GridListItem
								key={section.id}
								textValue={section.name}
								className="w-full outline-none"
							>
								<SectionComponent
									id={section.id}
									name={section.name}
									onDelete={() => deleteSection(section.id)}
								/>
							</GridListItem>
						)}
					</GridList>
				</div>
				<div className="flex justify-center">
					<div className="flex justify-center">
						<Button
							className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500"
							onPress={() => spaceId && createSection(spaceId)}
							isDisabled={isCreating}
						>
							<Plus className="w-3 h-3" />
							<div>RESOURCE SECTION</div>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Resources
