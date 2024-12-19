'use client'

import { useAppSelector } from '@/app/lib/redux/hooks'
import { File } from 'lucide-react'
import { useRef, useState } from 'react'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'
import { selectSortedResourcesBySectionId } from '@/app/lib/redux/features/resource/selector'
import type { Section } from '@/app/lib/redux/features/section/types/section'
import SectionMenu from '@/app/features/section/components/main/SectionMenu'
import SectionNameEdit from '@/app/features/section/components/main/SectionNameEdit'
import ResourceList from '@/app/features/resource/components/main/ResourceList'
import ResourceCreateButton from '@/app/features/resource/components/main/ResourceCreateButton'
import {
	DndContext,
	type DragEndEvent,
	pointerWithin,
	DragOverlay,
	type DragStartEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import ResourceIcon from '@/app/components/elements/ResourceIcon'

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
		<div className="flex flex-grow flex-col group/item bg-white shadow-lg rounded-md p-2 w-[260px]">
			<div className="flex items-center gap-2">
				<ResourceIcon faviconUrl={resource.faviconUrl} url={resource.url} />
				<span className="truncate">{resource.title}</span>
			</div>
		</div>
	)
}

const SectionList = () => {
	const sections = useAppSelector(selectSectionsByActiveSpace)
	const [draggingResource, setDraggingResource] = useState<Resource | null>(
		null,
	)
	const allResources = useAppSelector((state) =>
		sections.flatMap((section) =>
			selectSortedResourcesBySectionId(state, section.id),
		),
	)

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

		const isDropOnSection = sections.some((section) => section.id === over.id)

		const dragEndEvent = new CustomEvent('resourceDragEnd', {
			detail: {
				active,
				over,
				isDropOnSection,
			},
		})
		document.dispatchEvent(dragEndEvent)
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
