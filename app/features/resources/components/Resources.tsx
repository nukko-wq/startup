'use client'

import { useEffect, useMemo, memo } from 'react'
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

const Resources = memo(({ initialData, spaceId }: ResourceProps) => {
	const {
		isLoading: isSpaceLoading,
		activeSpaceId,
		isNavigating,
		spaces,
	} = useSpaceStore()

	const {
		sections,
		resources,
		isLoading,
		setSections,
		setResources,
		fetchSections,
		createSection,
		isCreating,
	} = useResourceStore()

	// スペースが選択されているかどうかをチェック
	const hasActiveSpace = useMemo(() => {
		return spaces.some((space) => space.isLastActive) || activeSpaceId
	}, [spaces, activeSpaceId])

	// メモ化によるレンダリングの最適化
	const memoizedSections = useMemo(() => sections, [sections])
	const memoizedResources = useMemo(() => resources, [resources])

	// 初期データのセットアップを修正
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!initialData || !spaceId) return

		// 初期データをセット
		setSections(initialData.sections)

		// リソースデータを構築
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

		setResources(initialResources)

		// キャッシュを更新
		const cacheKey = `sections-${spaceId}`
		sessionStorage.setItem(
			cacheKey,
			JSON.stringify({
				sections: initialData.sections,
				resources: initialResources,
				timestamp: Date.now(),
			}),
		)
	}, [initialData, spaceId])

	// spaceIdが変更されたときのデータ取得
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!spaceId) return

		const loadData = async () => {
			try {
				const data = await fetchSections(spaceId)
				if (data) {
					setSections(data.sections)
					setResources(data.resources)
				}
			} catch (error) {
				console.error('Error loading section data:', error)
			}
		}

		loadData()
	}, [spaceId])

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

	// ローディング条件を修正
	if (isSpaceLoading || isNavigating || (isLoading && !sections.length)) {
		return (
			<div className="flex items-center justify-center h-full">
				<LoadingSpinner className="w-14 h-14" />
			</div>
		)
	}

	return (
		<div className="flex flex-col flex-grow w-full">
			{!hasActiveSpace ? (
				<div className="flex items-center justify-center h-full text-gray-500">
					Select a Space to Get Started
				</div>
			) : (
				<>
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
									onPress={() => spaceId && createSection(spaceId)}
									isDisabled={isLoading || isCreating}
								>
									<Plus className="w-3 h-3" />
									<div>RESOURCE SECTION</div>
								</Button>
							</div>
						</div>
					</div>
					{/*}
					{(isLoading || isNavigating) && (
						<div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px] transition-opacity duration-300">
							<LoadingSpinner />
						</div>
					)}
					*/}
				</>
			)}
		</div>
	)
})

export default Resources
