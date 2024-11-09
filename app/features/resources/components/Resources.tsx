'use client'

import { useEffect } from 'react'
import { ResourceProvider } from '@/app/features/resources/contexts/ResourceContext'
import {
	Button,
	GridList,
	GridListItem,
	useDragAndDrop,
	DropIndicator,
} from 'react-aria-components'
import Section from '@/app/features/sections/components/Section'
import type { getInitialSections } from '@/app/features/resources/utils/getInitialSections'
import { Plus } from 'lucide-react'
import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'
import { useResourceStore } from '@/app/store/resourceStore'

interface ResourceProps {
	initialData: Awaited<ReturnType<typeof getInitialSections>>
	spaceId?: string
	spaceName?: string
}

const Resources = ({ initialData, spaceId, spaceName }: ResourceProps) => {
	const { isLoading: isSpaceLoading, activeSpaceId, isNavigating } = useSpaces()
	const {
		sections,
		isLoading,
		isCreating,
		setSections,
		fetchSections,
		createSection,
		deleteSection,
		reorderSections,
	} = useResourceStore()

	// 初期データの同期
	useEffect(() => {
		if (initialData.sections.length > 0) {
			setSections(initialData.sections)
		}
	}, [initialData.sections, setSections])

	// スペース切り替え時のデータ取得
	useEffect(() => {
		if (
			spaceId &&
			spaceId === activeSpaceId &&
			!isNavigating &&
			!isSpaceLoading
		) {
			fetchSections(spaceId)
		}
	}, [spaceId, activeSpaceId, isNavigating, isSpaceLoading, fetchSections])

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
		<ResourceProvider
			initialResources={initialData.sections.flatMap((s) => s.resources)}
			sections={sections}
		>
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
									<Section
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
		</ResourceProvider>
	)
}

export default Resources
