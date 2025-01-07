'use client'

import SectionItem from '@/app/features/section/components/main/SectionItem'
import { reorderResources } from '@/app/lib/redux/features/resource/resourceAPI'
import { setResources } from '@/app/lib/redux/features/resource/resourceSlice'
import { reorderSections } from '@/app/lib/redux/features/section/sectionAPI'
import { setSections } from '@/app/lib/redux/features/section/sectionSlice'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import {
	DragDropContext,
	Draggable,
	type DropResult,
	Droppable,
} from '@hello-pangea/dnd'

const SectionList = () => {
	const sections = useAppSelector(selectSectionsByActiveSpace)
	const dispatch = useAppDispatch()
	const activeSpaceId = useAppSelector((state) => state.space.activeSpaceId)
	const allResources = useAppSelector((state) => state.resource.resources)

	const onDragEnd = async (result: DropResult) => {
		const { source, destination, draggableId, type } = result

		if (!destination || !activeSpaceId) return
		if (!source.droppableId || !destination.droppableId) return

		// セクションのドラッグ&ドロップ処理
		if (type === 'section') {
			const items = Array.from(sections)
			const [reorderedItem] = items.splice(source.index, 1)
			items.splice(destination.index, 0, reorderedItem)

			// 新しい順序でセクションを一時的に更新（楽観的更新）
			const updatedItems = items.map((section, index) => ({
				...section,
				order: index,
			}))

			dispatch(setSections(updatedItems))

			try {
				const updatedSections = await reorderSections(
					activeSpaceId,
					updatedItems,
				)
				// APIからの応答で最新のセクションデータを更新
				dispatch(setSections(updatedSections))
			} catch (error) {
				console.error('セクションの並び替えに失敗しました:', error)
				// エラーの場合は元の配列に戻す
				dispatch(setSections(sections))
			}
			return
		}

		// リソースのドラッグ&ドロップ処理
		const sourceResources = allResources
			.filter((resource) => resource.sectionId === source.droppableId)
			.sort((a, b) => a.order - b.order)

		const destinationResources = allResources
			.filter((resource) => resource.sectionId === destination.droppableId)
			.sort((a, b) => a.order - b.order)

		// 同じセクション内での並び替え
		if (source.droppableId === destination.droppableId) {
			const newResources = Array.from(sourceResources)
			const [movedResource] = newResources.splice(source.index, 1)
			newResources.splice(destination.index, 0, movedResource)

			// 楽観的更新の修正
			const updatedResources = allResources.map((resource) => {
				if (resource.sectionId !== source.droppableId) return resource
				const index = newResources.findIndex((r) => r.id === resource.id)
				if (index === -1) return resource
				return {
					...resource,
					order: index,
				}
			})
			dispatch(setResources(updatedResources))

			try {
				const updatedFromApi = await reorderResources({
					resourceId: draggableId,
					destinationSectionId: destination.droppableId,
					newOrder: destination.index,
				})
				dispatch(setResources(updatedFromApi))
			} catch (error) {
				console.error('リソースの並び替えに失敗しました:', error)
				dispatch(setResources(allResources)) // 元の状態に戻す
			}
		}
		// 異なるセクション間での移動
		else {
			const sourceItems = Array.from(sourceResources)
			const [movedResource] = sourceItems.splice(source.index, 1)
			const destinationItems = Array.from(destinationResources)
			destinationItems.splice(destination.index, 0, {
				...movedResource,
				sectionId: destination.droppableId,
			})

			// 楽観的更新の改善
			const updatedResources = allResources.map((resource) => {
				// 移動したリソースの更新
				if (resource.id === movedResource.id) {
					return {
						...resource,
						sectionId: destination.droppableId,
						order: destination.index,
					}
				}

				// 移動元セクションのリソースの更新
				if (resource.sectionId === source.droppableId) {
					const newIndex = sourceItems.findIndex((r) => r.id === resource.id)
					return {
						...resource,
						order: newIndex === -1 ? resource.order : newIndex,
					}
				}

				// 移動先セクションのリソースの更新
				if (resource.sectionId === destination.droppableId) {
					const newIndex = destinationItems.findIndex(
						(r) => r.id === resource.id,
					)
					return {
						...resource,
						order: newIndex === -1 ? resource.order : newIndex,
					}
				}

				return resource
			})

			dispatch(setResources(updatedResources))

			try {
				const updatedFromApi = await reorderResources({
					resourceId: draggableId,
					destinationSectionId: destination.droppableId,
					newOrder: destination.index,
				})
				dispatch(setResources(updatedFromApi))
			} catch (error) {
				console.error('リソースの移動に失敗しました:', error)
				dispatch(setResources(allResources)) // 元の状態に戻す
			}
		}
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="sections" type="section">
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
