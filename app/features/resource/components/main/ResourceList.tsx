'use client'

import { useAppSelector } from '@/app/lib/redux/hooks'
import { selectSortedResourcesBySectionId } from '@/app/lib/redux/features/resource/selector'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import ResourceItem from '@/app/features/resource/components/main/ResourceItem'

interface ResourceListProps {
	sectionId: string
}

const ResourceList = ({ sectionId }: ResourceListProps) => {
	const resources = useAppSelector((state) =>
		selectSortedResourcesBySectionId(state, sectionId),
	)

	return (
		<Droppable droppableId={sectionId}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.droppableProps}
					className={`flex flex-col justify-center border-slate-400 rounded-md outline-none bg-white shadow-sm ${
						snapshot.isDraggingOver ? 'bg-gray-50' : ''
					}`}
				>
					{resources.length === 0 && !snapshot.isDraggingOver ? (
						<div className="flex flex-col justify-center items-center h-[52px]">
							<div className="text-gray-500">Add resources here</div>
						</div>
					) : (
						<div className={`min-h-[52px] ${resources.length === 0 ? '' : ''}`}>
							{resources.map((resource, index) => (
								<Draggable
									key={resource.id}
									draggableId={resource.id}
									index={index}
								>
									{(provided) => (
										<ResourceItem resource={resource} provided={provided} />
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</div>
			)}
		</Droppable>
	)
}

export default ResourceList
