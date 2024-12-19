'use client'

import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import { File, GripVertical } from 'lucide-react'
import { useRef, useState } from 'react'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'
import { selectResourcesByActiveSpace } from '@/app/lib/redux/features/resource/selector'
import type { Section } from '@/app/lib/redux/features/section/types/section'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import SectionMenu from '@/app/features/section/components/main/SectionMenu'
import SectionNameEdit from '@/app/features/section/components/main/SectionNameEdit'
import ResourceList from '@/app/features/resource/components/main/ResourceList'
import ResourceCreateButton from '@/app/features/resource/components/main/ResourceCreateButton'
import ResourceIcon from '@/app/components/elements/ResourceIcon'
import { getResourceDescription } from '@/app/lib/utils/getResourceDescription'
import {
	DndContext,
	type DragEndEvent,
	pointerWithin,
	DragOverlay,
	type DragStartEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import {
	moveResource,
	reorderResources,
} from '@/app/lib/redux/features/resource/resourceSlice'

interface SectionItemProps {
	section: Section
}

const SectionItem = ({ section }: SectionItemProps) => {
	const resourceCreateButtonRef = useRef<HTMLButtonElement>(null)
	const { setNodeRef, isOver } = useDroppable({
		id: section.id,
		data: {
			type: 'section',
			section,
		},
	})

	const handleAddResourceClick = () => {
		resourceCreateButtonRef.current?.click()
	}

	return (
		<div
			ref={setNodeRef}
			className={`min-w-[260px] max-w-[920px] w-full pl-[16px] pr-[32px] py-5 outline-none
				${isOver ? 'bg-slate-100 rounded-md transition-colors duration-200' : ''}`}
		>
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center ml-4">
					<File className="w-6 h-6 text-slate-700" />
					<SectionNameEdit section={section} />
				</div>
				<div className="hidden md:flex">
					<ResourceCreateButton
						ref={resourceCreateButtonRef}
						section={section}
					/>
					<SectionMenu
						section={section}
						onAddResourceClick={handleAddResourceClick}
					/>
				</div>
			</div>
			<div className={`${isOver ? 'ring-2 ring-blue-400 rounded-md' : ''}`}>
				<ResourceList sectionId={section.id} />
			</div>
		</div>
	)
}

const DraggingResourceItem = ({ resource }: { resource: Resource }) => {
	return (
		<div className="flex flex-grow flex-col group/item bg-white shadow-lg rounded-md min-w-[260px] w-full max-w-[920px]">
			<div className="grid grid-cols-[32px_1fr_74px] items-center px-1 pt-1 pb-2">
				<div className="flex items-center p-2">
					<div>
						<GripVertical className="w-4 h-4 text-slate-500" />
					</div>
				</div>
				<div className="flex items-end gap-2 truncate">
					<ResourceIcon faviconUrl={resource.faviconUrl} url={resource.url} />
					<div className="flex flex-col truncate">
						<span className="truncate">{resource.title}</span>
						<span className="text-xs text-gray-400">
							{getResourceDescription(resource)}
						</span>
					</div>
				</div>
				<div className="flex items-center" />
			</div>
		</div>
	)
}

const SectionList = () => {
	const sections = useAppSelector(selectSectionsByActiveSpace)
	const [draggingResource, setDraggingResource] = useState<Resource | null>(
		null,
	)
	const allResources = useAppSelector(selectResourcesByActiveSpace)
	const dispatch = useAppDispatch()

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		const resource = allResources.find((r) => r.id === active.id)
		if (resource) {
			setDraggingResource(resource)
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (!over) return

		const activeResource = allResources.find((r) => r.id === active.id)
		if (!activeResource) return

		const fromSectionId = activeResource.sectionId
		const isDropOnSection = sections.some((section) => section.id === over.id)
		const toSectionId = isDropOnSection
			? String(over.id)
			: allResources.find((r) => r.id === over.id)?.sectionId

		if (!toSectionId) return

		if (fromSectionId !== toSectionId) {
			// 別のセクションへの移動
			const targetSectionResources = allResources
				.filter((r) => r.sectionId === toSectionId)
				.sort((a, b) => a.order - b.order)

			let newIndex = 0
			if (!isDropOnSection && over.id) {
				newIndex = targetSectionResources.findIndex((r) => r.id === over.id)
			}

			dispatch(
				moveResource({
					resourceId: String(active.id),
					fromSectionId,
					toSectionId,
					newIndex,
				}),
			)
		} else {
			// 同じセクション内での移動
			const sectionResources = allResources
				.filter((r) => r.sectionId === fromSectionId)
				.sort((a, b) => a.order - b.order)

			const oldIndex = sectionResources.findIndex((r) => r.id === active.id)
			const newIndex = sectionResources.findIndex((r) => r.id === over.id)

			if (oldIndex !== newIndex) {
				dispatch(
					reorderResources({
						sectionId: fromSectionId,
						oldIndex,
						newIndex,
					}),
				)
			}
		}

		setDraggingResource(null)
	}

	return (
		<DndContext
			collisionDetection={pointerWithin}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex flex-col w-full gap-2">
				{sections.map((section) => (
					<div key={section.id} className="outline-none group">
						<SectionItem section={section} />
					</div>
				))}
			</div>
			<DragOverlay>
				{draggingResource && (
					<DraggingResourceItem resource={draggingResource} />
				)}
			</DragOverlay>
		</DndContext>
	)
}

export default SectionList
