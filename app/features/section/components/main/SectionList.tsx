'use client'

import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from '@hello-pangea/dnd'
import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import SectionItem from '@/app/features/section/components/main/SectionItem'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'
import {
	updateSection,
	setSections,
} from '@/app/lib/redux/features/section/sectionSlice'
import { reorderSections } from '@/app/lib/redux/features/section/sectionAPI'

const SectionList = () => {
	const sections = useAppSelector(selectSectionsByActiveSpace)
	const dispatch = useAppDispatch()
	const activeSpaceId = useAppSelector((state) => state.space.activeSpaceId)

	const onDragEnd = async (result: DropResult) => {
		if (!result.destination || !activeSpaceId) return

		const items = Array.from(sections)
		const [reorderedItem] = items.splice(result.source.index, 1)
		items.splice(result.destination.index, 0, reorderedItem)

		// 新しい順序でセクションを一時的に更新（楽観的更新）
		const updatedItems = items.map((section, index) => ({
			...section,
			order: index,
		}))

		dispatch(setSections(updatedItems))

		// APIを呼び出して永続化
		try {
			const updatedSections = await reorderSections(activeSpaceId, updatedItems)
			// APIからの応答で最新のセクションデータを更新
			dispatch(setSections(updatedSections))
		} catch (error) {
			console.error('セクションの並び替えに失敗しました:', error)
			// エラーの場合は元の配列に戻す
			dispatch(setSections(sections))
		}
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="sections">
				{(provided) => (
					<div
						className="flex flex-col w-full"
						{...provided.droppableProps}
						ref={provided.innerRef}
					>
						{sections.map((section, index) => (
							<Draggable
								key={section.id}
								draggableId={section.id}
								index={index}
							>
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										{...provided.dragHandleProps}
										className="outline-none group"
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
		</DragDropContext>
	)
}

export default SectionList
