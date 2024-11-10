'use client'

import { useEffect, useMemo } from 'react'
import {
	Button,
	GridList,
	GridListItem,
	useDragAndDrop,
} from 'react-aria-components'
import SectionComponent from '@/app/features/sections/components/Section'
import type { Section } from '@/app/types/section'
import { Plus } from 'lucide-react'
import { useSpaceStore } from '@/app/store/spaceStore'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'
import { useResourceStore } from '@/app/store/resourceStore'

interface ResourceProps {
	initialData: { sections: Section[]; userId: string; spaceId: string }
	spaceId: string
}

const Resources = ({ initialData, spaceId }: ResourceProps) => {
	const {
		isLoading: isSpaceLoading,
		activeSpaceId,
		isNavigating,
	} = useSpaceStore()

	const {
		sections,
		resources,
		isLoading,
		setSections,
		setResources,
		fetchSections,
	} = useResourceStore()

	// メモ化によるレンダリングの最適化
	const memoizedSections = useMemo(() => sections, [sections])
	const memoizedResources = useMemo(() => resources, [resources])

	// 初期データのセットを最適化
	useEffect(() => {
		if (!initialData || !spaceId) return

		const initialResources = initialData.sections.flatMap(
			(section) =>
				section.resources?.map((resource) => ({
					id: resource.id,
					title: resource.title,
					url: resource.url,
					faviconUrl: resource.faviconUrl,
					mimeType: resource.mimeType,
					isGoogleDrive: resource.isGoogleDrive,
					position: resource.position,
					description: resource.description,
					sectionId: section.id,
				})) ?? [],
		)

		// バッチ更新を requestAnimationFrame で最適化
		requestAnimationFrame(() => {
			setSections(initialData.sections)
			setResources(initialResources)
		})

		// キャッシュの保存を別のタイミングで実行
		queueMicrotask(() => {
			sessionStorage.setItem(
				`sections-${spaceId}`,
				JSON.stringify({
					sections: initialData.sections,
					resources: initialResources,
				}),
			)
		})
	}, [initialData, spaceId, setSections, setResources])

	// スペース切り替え時のデータ取得を最適化
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const cacheKey = `sections-${spaceId}`
		const cachedData = sessionStorage.getItem(cacheKey)

		if (!isNavigating && spaceId && !cachedData) {
			fetchSections(spaceId)
		}
	}, [spaceId, isNavigating])

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

		onReorder: async (e) => {
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

			await fetchSections(spaceId)
		},
	})

	if (isSpaceLoading || isNavigating) {
		return (
			<div className="flex items-center justify-center h-full">
				<LoadingSpinner className="w-14 h-14" />
			</div>
		)
	}

	return (
		<div className="flex flex-col flex-grow w-full">
			<div
				className={`flex flex-col w-full outline-none transition-opacity duration-300 ${
					isLoading || isNavigating ? 'opacity-50' : 'opacity-100'
				}`}
			>
				<div className="flex flex-col w-full items-center">
					<GridList
						aria-label="Draggable sections"
						items={memoizedSections}
						dragAndDropHooks={dragAndDropHooks}
						className="w-full outline-none"
					>
						{(section) => (
							<GridListItem
								key={section.id}
								textValue={section.name}
								className="w-full outline-none"
							>
								<SectionComponent
									id={section.id}
									name={section.name}
									onDelete={() => fetchSections(spaceId)}
								/>
							</GridListItem>
						)}
					</GridList>
				</div>
				<div className="flex justify-center">
					<div className="flex justify-center">
						<Button
							className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500"
							onPress={() => spaceId && fetchSections(spaceId)}
							isDisabled={isLoading}
						>
							<Plus className="w-3 h-3" />
							<div>RESOURCE SECTION</div>
						</Button>
					</div>
				</div>
			</div>
			{(isLoading || isNavigating) && (
				<div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px] transition-opacity duration-300">
					<LoadingSpinner />
				</div>
			)}
		</div>
	)
}

export default Resources
