'use client'

import ResourceItem from '@/app/features/resource/components/main/ResourceItem'
import { selectSortedResourcesBySectionId } from '@/app/lib/redux/features/resource/selector'
import { useAppSelector } from '@/app/lib/redux/hooks'
import { Draggable, Droppable } from '@hello-pangea/dnd'

interface ResourceListProps {
	sectionId: string
}

const ResourceList = ({ sectionId }: ResourceListProps) => {
	const resources = useAppSelector((state) =>
		selectSortedResourcesBySectionId(state, sectionId),
	)

	return (
		<Droppable droppableId={sectionId} type="DEFAULT">
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.droppableProps}
					className={`flex flex-col justify-center border-slate-400 rounded-md outline-hidden bg-white shadow-xs ${
						snapshot.isDraggingOver ? 'bg-blue-50' : ''
					}`}
				>
					{resources.length === 0 && !snapshot.isDraggingOver ? (
						<div className="flex h-[52px] flex-col items-center justify-center">
							<div className="text-gray-500">Add resources here</div>
						</div>
					) : (
						<div className={`min-h-[48px] ${resources.length === 0 ? '' : ''}`}>
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
