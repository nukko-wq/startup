'use client'

import SectionItem from '@/app/features/section/components/main/SectionItem'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'
import { useAppSelector } from '@/app/lib/redux/hooks'
import { Draggable, Droppable } from '@hello-pangea/dnd'

const SectionList = () => {
	const { sections } = useAppSelector(selectSectionsByActiveSpace)

	return (
		<Droppable droppableId="sections" type="section">
			{(provided) => (
				<div
					className="flex w-full flex-col"
					{...provided.droppableProps}
					ref={provided.innerRef}
				>
					{sections.map((section, index) => (
						<Draggable key={section.id} draggableId={section.id} index={index}>
							{(provided) => (
								<div
									ref={provided.innerRef}
									{...provided.draggableProps}
									{...provided.dragHandleProps}
									className="group outline-hidden"
								>
									<SectionItem section={section} />
								</div>
							)}
						</Draggable>
					))}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	)
}

export default SectionList
