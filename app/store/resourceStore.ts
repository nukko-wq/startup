import { create } from 'zustand'
import type { Resource } from '@prisma/client'
import type { Section } from '@/app/types/section'
import { devtools, persist } from 'zustand/middleware'

export interface DriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
}

export interface SectionData {
	sections: Section[]
	resources: Pick<
		Resource,
		| 'id'
		| 'title'
		| 'description'
		| 'url'
		| 'faviconUrl'
		| 'mimeType'
		| 'isGoogleDrive'
		| 'position'
		| 'sectionId'
	>[]
}

// キャッシュの型を修正
interface ResourceCacheEntry {
	sections: Section[]
	resources: Pick<
		Resource,
		| 'id'
		| 'title'
		| 'description'
		| 'url'
		| 'faviconUrl'
		| 'mimeType'
		| 'isGoogleDrive'
		| 'position'
		| 'sectionId'
	>[]
	timestamp: number
}

export interface ResourceStore {
	sections: Section[]
	resources: Pick<
		Resource,
		| 'id'
		| 'title'
		| 'description'
		| 'url'
		| 'faviconUrl'
		| 'mimeType'
		| 'isGoogleDrive'
		| 'position'
		| 'sectionId'
	>[]
	driveFiles: DriveFile[]
	isLoading: boolean
	isCreating: boolean
	setIsCreating: (creating: boolean) => void
	setSections: (sections: Section[]) => void
	setIsLoading: (loading: boolean) => void
	fetchSections: (spaceId: string) => Promise<SectionData>
	createSection: (spaceId: string) => Promise<void>
	deleteSection: (sectionId: string) => Promise<void>
	reorderSections: (items: Section[]) => Promise<void>
	setResources: (
		resources:
			| ResourceStore['resources']
			| ((prev: ResourceStore['resources']) => ResourceStore['resources']),
	) => void
	setDriveFiles: (files: DriveFile[]) => void
	removeResource: (id: string) => Promise<void>
	updateResource: (
		id: string,
		data: Partial<ResourceStore['resources'][0]>,
	) => Promise<void>
	addResource: {
		(resource: ResourceStore['resources'][0]): Promise<void>
		(
			updater: (prev: ResourceStore['resources']) => ResourceStore['resources'],
		): Promise<void>
	}
	reorderResources: (newResources: ResourceStore['resources']) => Promise<void>
	updateAllResources: (newResources: ResourceStore['resources']) => void
	prefetchedSections: Record<string, Section[]>
	setPrefetchedSections: (spaceId: string, sections: Section[]) => void
	prefetchedResources: Record<string, ResourceStore['resources']>
	setPrefetchedResources: (
		spaceId: string,
		resources: ResourceStore['resources'],
	) => void
	prefetchNextSpace: (spaceId: string) => Promise<void>
	clearPrefetchedData: (spaceId: string) => void

	// キャッシュ管理を改善
	resourceCache: Map<string, ResourceCacheEntry>

	// キャッシュ有効期限（例：5分）
	CACHE_EXPIRY: number

	// hydrationのためのメソッドを追加
	hydrateResourceCache: (
		cache: Record<
			string,
			{
				sections: Section[]
				resources: Resource[]
				timestamp: number
			}
		>,
	) => void

	updateSection: (sectionId: string, data: { name: string }) => Promise<void>
}

export const useResourceStore = create<ResourceStore>()(
	devtools(
		persist(
			(set, get) => ({
				sections: [],
				resources: [],
				driveFiles: [],
				isLoading: false,
				isCreating: false,
				prefetchedSections: {},
				prefetchedResources: {},

				// キャッシュ管理を改善
				resourceCache: new Map(),

				// キャッシュ有効期限（例：5分）
				CACHE_EXPIRY: 5 * 60 * 1000,

				setIsCreating: (creating) => set({ isCreating: creating }),
				setSections: (sections) => set({ sections }),
				setIsLoading: (loading) => set({ isLoading: loading }),

				setPrefetchedSections: (spaceId, sections) =>
					set((state) => ({
						prefetchedSections: {
							...state.prefetchedSections,
							[spaceId]: sections,
						},
					})),

				setPrefetchedResources: (spaceId, resources) =>
					set((state) => ({
						prefetchedResources: {
							...state.prefetchedResources,
							[spaceId]: resources,
						},
					})),

				fetchSections: async (spaceId): Promise<SectionData> => {
					if (!spaceId) return { sections: [], resources: [] }

					const cachedData = get().resourceCache.get(spaceId)
					if (cachedData) {
						set({
							sections: cachedData.sections,
							resources: cachedData.resources,
							isLoading: false,
						})
						return cachedData
					}

					try {
						const response = await fetch(`/api/spaces/${spaceId}/sections`)
						if (!response.ok) throw new Error('Failed to fetch sections')

						const data = await response.json()
						const formattedData = {
							sections: data.sections,
							resources: data.resources,
						}

						// キャッシュを更新
						get().resourceCache.set(spaceId, {
							...formattedData,
							timestamp: Date.now(),
						})

						set({
							sections: formattedData.sections,
							resources: formattedData.resources,
							isLoading: false,
						})

						return formattedData
					} catch (error) {
						console.error('Error fetching sections:', error)
						throw error
					}
				},

				createSection: async (spaceId) => {
					const { sections, setIsCreating, setIsLoading } = get()

					try {
						setIsCreating(true)
						setIsLoading(true)

						const response = await fetch('/api/sections', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								name: 'Resources',
								order: sections.length,
								spaceId: spaceId,
							}),
							credentials: 'include',
						})

						if (!response.ok) {
							throw new Error('セクションの作成に失敗しました')
						}

						const newSection = await response.json()
						set({ sections: [...sections, newSection] })

						return newSection
					} catch (error) {
						console.error('セクション作成エラー:', error)
						throw error instanceof Error
							? error
							: new Error('セクションの作成に失敗しました')
					} finally {
						setIsCreating(false)
						setIsLoading(false)
					}
				},

				deleteSection: async (sectionId: string) => {
					const { sections, resources } = get()
					const previousSections = [...sections]
					const previousResources = [...resources]

					try {
						// 先に状態を更新
						set({
							sections: sections.filter((section) => section.id !== sectionId),
							// このセクションに属するリソースも削除
							resources: resources.filter(
								(resource) => resource.sectionId !== sectionId,
							),
						})

						const response = await fetch(`/api/sections/${sectionId}`, {
							method: 'DELETE',
							headers: {
								'Content-Type': 'application/json',
							},
							credentials: 'include',
						})

						if (!response.ok) {
							// エラーの場合は元の状態に戻す
							set({
								sections: previousSections,
								resources: previousResources,
							})
							throw new Error('セクションの削除に失敗しました')
						}
					} catch (error) {
						console.error('セクション削除エラー:', error)
						// エラーの場合は元の状態に戻す
						set({
							sections: previousSections,
							resources: previousResources,
						})
						throw error
					}
				},

				reorderSections: async (items) => {
					const { sections } = get()
					try {
						set({ sections: items })

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
						set({ sections }) // 元の状態に戻す
						alert('セクションの並び順の更新に失敗しました')
					}
				},

				setResources: (
					resources:
						| ResourceStore['resources']
						| ((
								prev: ResourceStore['resources'],
						  ) => ResourceStore['resources']),
				) => {
					if (typeof resources === 'function') {
						set({ resources: resources(get().resources) })
					} else {
						set({ resources })
					}
				},
				setDriveFiles: (files) => set({ driveFiles: files }),

				removeResource: async (id) => {
					const { resources } = get()
					const previousResources = [...resources]

					try {
						set({
							resources: resources.filter((resource) => resource.id !== id),
						})

						const response = await fetch(`/api/resources/${id}`, {
							method: 'DELETE',
						})

						if (!response.ok) {
							throw new Error('Failed to delete resource')
						}
					} catch (error) {
						set({ resources: previousResources })
						throw error
					}
				},

				updateResource: async (id, data) => {
					const { resources } = get()
					const previousResources = [...resources]

					try {
						set({
							resources: resources.map((resource) =>
								resource.id === id ? { ...resource, ...data } : resource,
							),
						})

						const response = await fetch(`/api/resources/${id}`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(data),
						})

						if (!response.ok) {
							throw new Error('Failed to update resource')
						}
					} catch (error) {
						set({ resources: previousResources })
						throw error
					}
				},

				addResource: async (
					resourceOrUpdater:
						| ResourceStore['resources'][0]
						| ((
								prev: ResourceStore['resources'],
						  ) => ResourceStore['resources']),
				) => {
					if (typeof resourceOrUpdater === 'function') {
						const currentResources = get().resources
						const updatedResources = resourceOrUpdater(currentResources)
						set({ resources: updatedResources })
						return Promise.resolve()
					}

					const { resources } = get()
					set({ resources: [...resources, resourceOrUpdater] })
					return Promise.resolve()
				},

				reorderResources: async (newResources) => {
					const { resources } = get()
					const previousResources = [...resources]

					try {
						set({ resources: newResources })

						const payload = {
							items: newResources.map((item) => ({
								id: item.id,
								position: item.position,
								sectionId: item.sectionId,
							})),
						}

						const response = await fetch('/api/resources/reorder', {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(payload),
						})

						if (!response.ok) {
							throw new Error('Failed to reorder resources')
						}
					} catch (error) {
						console.error('Reorder error:', error)
						set({ resources: previousResources })
						throw error
					}
				},

				updateAllResources: (newResources) => {
					set({
						resources: newResources.sort((a, b) => {
							if (a.sectionId === b.sectionId) {
								return a.position - b.position
							}
							return 0
						}),
					})
				},

				prefetchNextSpace: async (spaceId: string) => {
					try {
						const cacheKey = `sections-${spaceId}`
						const cachedData = sessionStorage.getItem(cacheKey)

						// すでにキャッシュがある場合は早期リターン
						if (cachedData || get().prefetchedSections[spaceId]) {
							return
						}

						// AbortControllerを使用してフェッチをキャンセル可能に
						const controller = new AbortController()
						const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒でタイムアウト

						const response = await fetch(`/api/spaces/${spaceId}/sections`, {
							signal: controller.signal,
						})

						clearTimeout(timeoutId)
						if (!response.ok) return

						const data = await response.json()

						// メモリとセッションストレージに同時に保存
						Promise.all([
							set((state) => ({
								prefetchedSections: {
									...state.prefetchedSections,
									[spaceId]: data.sections,
								},
								prefetchedResources: {
									...state.prefetchedResources,
									[spaceId]: data.resources,
								},
							})),
							sessionStorage.setItem(
								cacheKey,
								JSON.stringify({
									sections: data.sections,
									resources: data.resources,
								}),
							),
						])
					} catch (error: unknown) {
						if (error instanceof Error && error.name === 'AbortError') return
						console.error('Error prefetching space data:', error)
					}
				},

				clearPrefetchedData: (spaceId: string) => {
					set((state) => {
						const { [spaceId]: _, ...remainingSections } =
							state.prefetchedSections
						const { [spaceId]: __, ...remainingResources } =
							state.prefetchedResources
						return {
							prefetchedSections: remainingSections,
							prefetchedResources: remainingResources,
						}
					})
				},

				// hydrationのためのメソッドを追加
				hydrateResourceCache: (
					cache: Record<
						string,
						{
							sections: Section[]
							resources: Resource[]
							timestamp: number
						}
					>,
				) => {
					const newMap = new Map(Object.entries(cache))
					set({ resourceCache: newMap })
				},

				updateSection: async (sectionId: string, data: { name: string }) => {
					const { sections, resources } = get()
					const previousSections = [...sections]

					try {
						// 更新対象のセクションを見つける
						const targetSection = sections.find(
							(section) => section.id === sectionId,
						)
						if (!targetSection) {
							throw new Error('セクションが見つかりません')
						}

						// 先に状態を更新
						const updatedSections = sections.map((section) =>
							section.id === sectionId
								? {
										...section,
										...data,
										resources: section.resources, // リソースを保持
									}
								: section,
						)

						set({ sections: updatedSections })

						const response = await fetch(`/api/sections/${sectionId}`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(data),
							credentials: 'include',
						})

						if (!response.ok) {
							set({ sections: previousSections })
							throw new Error('セクション名の更新に失敗しました')
						}

						// キャッシュの更新
						const spaceId = targetSection.spaceId
						if (spaceId) {
							// resourceCacheの更新
							const cache = get().resourceCache.get(spaceId)
							if (cache) {
								get().resourceCache.set(spaceId, {
									...cache,
									sections: cache.sections.map((section) =>
										section.id === sectionId
											? { ...section, ...data }
											: section,
									),
									timestamp: Date.now(),
								})
							}

							// セッションストレージの更新
							const cacheKey = `sections-${spaceId}`
							const cachedData = sessionStorage.getItem(cacheKey)
							if (cachedData) {
								const parsed = JSON.parse(cachedData)
								sessionStorage.setItem(
									cacheKey,
									JSON.stringify({
										...parsed,
										sections: parsed.sections.map((section: Section) =>
											section.id === sectionId
												? { ...section, ...data }
												: section,
										),
									}),
								)
							}
						}

						// 必要に応じてセクションデータを再取得
						if (spaceId) {
							await get().fetchSections(spaceId)
						}
					} catch (error) {
						console.error('Section update error:', error)
						set({ sections: previousSections })
						throw error
					}
				},
			}),
			{
				name: 'resource-storage',
				partialize: (state) => ({
					resourceCache: Object.fromEntries(state.resourceCache),
				}),
				onRehydrateStorage: () => (state) => {
					if (state) {
						// リハイドレート時にMapを再構築
						state.resourceCache = new Map(
							Object.entries(state.resourceCache || {}),
						)
					}
				},
			},
		),
	),
)
