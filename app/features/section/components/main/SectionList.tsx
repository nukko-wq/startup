'use client'

import { useAppSelector } from '@/app/lib/redux/hooks'
import { File } from 'lucide-react'
import { useRef } from 'react'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'
import type { Section } from '@/app/lib/redux/features/section/types/section'
import SectionMenu from '@/app/features/section/components/main/SectionMenu'
import SectionNameEdit from '@/app/features/section/components/main/SectionNameEdit'
import ResourceList from '@/app/features/resource/components/main/ResourceList'
import ResourceCreateButton from '@/app/features/resource/components/main/ResourceCreateButton'
import { DndContext, type DragEndEvent, pointerWithin } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'

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
				<div className="flex items-center ml-4 cursor-grab" slot="drag">
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
			<ResourceList sectionId={section.id} />
		</div>
	)
}

const SectionList = () => {
	const sections = useAppSelector(selectSectionsByActiveSpace)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (!over) return

		// セクションへのドロップかリソースへのドロップかを判定
		const isDropOnSection = sections.some((section) => section.id === over.id)

		// ドラッグ終了時の処理をResourceListコンポーネントに委譲
		const dragEndEvent = new CustomEvent('resourceDragEnd', {
			detail: {
				active,
				over,
				isDropOnSection,
			},
		})
		document.dispatchEvent(dragEndEvent)
	}

	return (
		<DndContext collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
			<div className="flex flex-col w-full gap-2">
				{sections.map((section) => (
					<div key={section.id} className="outline-none group">
						<SectionItem section={section} />
					</div>
				))}
			</div>
		</DndContext>
	)
}

export default SectionList
