'use client'

import { useState, useEffect } from 'react'
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

interface ResourceProps {
	initialData: Awaited<ReturnType<typeof getInitialSections>>
	spaceId?: string
	spaceName?: string
}

const Resources = ({ initialData, spaceId, spaceName }: ResourceProps) => {
	const [sections, setSections] = useState(initialData.sections)
	const [isCreating, setIsCreating] = useState(false)
	const [resources, setResources] = useState(
		initialData.sections.flatMap((s) => s.resources),
	)

	useEffect(() => {
		setSections(initialData.sections)
		setResources(initialData.sections.flatMap((s) => s.resources))
	}, [initialData.sections])

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

		/*
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`drop-indicator ${isDropTarget ? 'active' : ''}`
					}
				/>
			)
		},
		*/

		onReorder: async (e) => {
			try {
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

				setSections(items)

				const updatedItems = items.map((item, index) => ({
					id: item.id,
					order: index,
				}))

				const response = await fetch('/api/sections/reorder', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ items: updatedItems }),
				})

				if (!response.ok) {
					throw new Error('Failed to update order')
				}
			} catch (error) {
				console.error('Failed to update section order:', error)
				setSections(sections)
				alert('セクションの並び順の更新に失敗しました')
			}
		},
	})

	const handleSectionDelete = (sectionId: string) => {
		setSections((prev) => prev.filter((section) => section.id !== sectionId))
	}

	const handleCreateSection = async () => {
		// spaceIdがない場合はアラートを表示
		if (!spaceId) {
			alert('スペースを選択してください')
			return
		}

		if (isCreating) {
			return
		}

		setIsCreating(true)

		try {
			const requestBody = {
				name: 'Resources',
				order: sections.length,
				spaceId: spaceId,
			}
			console.log('Creating section with:', requestBody)

			const response = await fetch('/api/sections', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
				credentials: 'include',
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to create section')
			}

			const newSection = await response.json()
			setSections((prev) => [...prev, { ...newSection, resources: [] }])
		} catch (error) {
			console.error('Section creation error:', error)
			if (error instanceof Error && error.message.includes('認証')) {
				window.location.href = '/login'
				return
			}
			alert('セクションの作成に失敗しました')
		} finally {
			setIsCreating(false)
		}
	}

	return (
		<ResourceProvider
			initialResources={initialData.sections.flatMap((s) => s.resources)}
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
										onDelete={handleSectionDelete}
									/>
								</GridListItem>
							)}
						</GridList>
					</div>
					<div className="flex justify-center">
						<div className="flex justify-center">
							<Button
								className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500"
								onPress={handleCreateSection}
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
