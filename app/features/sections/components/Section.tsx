'use client'

import ResourceCreateButton from '@/app/features/resources/create_resource/components/ResourceCreateButton'
import ResourceItem from '@/app/features/resources/components/ResourceItem'
import { File } from 'lucide-react'
import type { Resource } from '@prisma/client'
import { useResources } from '@/app/features/resources/contexts/ResourceContext'
import { useEffect, useState, useRef } from 'react'
import { useDrop, type TextDropItem, isTextDropItem } from 'react-aria'

interface SectionProps {
	id: string
	name: string
}

export default function Section({ id, name }: SectionProps) {
	const { resources, setResources, reorderResources } = useResources()
	const [isDragging, setIsDragging] = useState(false)
	const dropRef = useRef<HTMLDivElement>(null)
	const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(
		null,
	)

	const sectionResources = resources
		.filter((resource) => resource.sectionId === id)
		.sort((a, b) => a.position - b.position)

	const { dropProps, isDropTarget } = useDrop({
		ref: dropRef,
		onDropEnter: () => {
			// ドロップ可能な状態になったときの処理
		},
		onDropExit: () => {
			setDropIndicatorIndex(null)
		},
		onDropMove: (e) => {
			const dropRefElement = dropRef.current
			if (!dropRefElement) return

			const containerRect = dropRefElement.getBoundingClientRect()
			const mouseY = e.y - containerRect.top

			// リソースアイテムの要素を取得
			const resourceElements = Array.from(
				dropRefElement.querySelectorAll('[data-droppable-item]'),
			) as HTMLElement[]

			if (resourceElements.length === 0) {
				setDropIndicatorIndex(0)
				return
			}

			// 各アイテムの位置をチェック
			for (let i = 0; i < resourceElements.length; i++) {
				const rect = resourceElements[i].getBoundingClientRect()
				const itemTop = rect.top - containerRect.top
				const itemBottom = itemTop + rect.height

				// マウスがアイテムの上半分にある場合
				if (mouseY < itemTop + rect.height / 2) {
					setDropIndicatorIndex(i)
					return
				}
				// マウスがアイテムの下半分にある場合
				if (mouseY < itemBottom) {
					setDropIndicatorIndex(i + 1)
					return
				}
			}

			// 最後のアイテムより下の場合
			setDropIndicatorIndex(resourceElements.length)
		},
		onDrop: async (e) => {
			const droppedItems = await Promise.all(
				e.items.filter(isTextDropItem).map(async (item) => {
					const data = JSON.parse(await item.getText('resource-item'))
					return data
				}),
			)

			if (droppedItems.length > 0) {
				const dropIndex = dropIndicatorIndex ?? sectionResources.length
				const droppedItem = droppedItems[0]

				// 同じセクション内での移動を考慮した新しい配列を作成
				const otherResources = resources.filter((r) => r.id !== droppedItem.id)
				const targetSectionResources = otherResources
					.filter((r) => r.sectionId === id)
					.sort((a, b) => a.position - b.position)

				// 新しい位置に挿入
				targetSectionResources.splice(dropIndex, 0, {
					...droppedItem,
					sectionId: id,
				})

				// position を更新
				const updatedSectionResources = targetSectionResources.map(
					(r, index) => ({
						...r,
						position: index + 1,
					}),
				)

				// 全リソースを更新
				const finalResources = [
					...otherResources.filter((r) => r.sectionId !== id),
					...updatedSectionResources,
				]

				try {
					await reorderResources(finalResources)
					setDropIndicatorIndex(null)
				} catch (error) {
					console.error('Failed to reorder resources:', error)
				}
			}
		},
	})

	useEffect(() => {
		if (isDragging) {
			// Update positions in the database
			const updatePositions = async () => {
				try {
					await fetch('/api/resources/reorder', {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							items: sectionResources.map((item, index) => ({
								id: item.id,
								position: index + 1,
								sectionId: id,
							})),
						}),
					})
				} catch (error) {
					console.error('Error updating positions:', error)
				}
			}
			updatePositions()
			setIsDragging(false)
		}
	}, [isDragging, sectionResources, id])

	return (
		<div
			ref={dropRef}
			{...dropProps}
			className={`min-w-[260px] max-w-[920px] w-full p-5 ${
				isDropTarget ? 'bg-zinc-100' : ''
			}`}
		>
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center gap-2 ml-4">
					<File className="w-6 h-6 text-zinc-700" />
					<div className="text-xl font-semibold text-zinc-700">{name}</div>
				</div>
				<div className="">
					<ResourceCreateButton sectionId={id} />
				</div>
			</div>
			<div className="flex flex-col border rounded-md relative">
				{dropIndicatorIndex === 0 && (
					<div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />
				)}
				{sectionResources.map((resource, index) => (
					<div key={resource.id} data-droppable-item className="relative">
						<ResourceItem resource={resource} />
						{dropIndicatorIndex === index + 1 && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />
						)}
					</div>
				))}
			</div>
		</div>
	)
}
