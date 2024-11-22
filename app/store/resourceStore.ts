import { create } from 'zustand'
import type { Resource } from '@prisma/client'
import type { Section } from '@/app/types/section'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

export interface DriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
}

export interface SectionData {
	sections: Section[]
	resources: {
		id: string
		title: string
		description: string | null
		url: string
		faviconUrl: string | null
		mimeType: string | null
		isGoogleDrive: boolean
		position: number
		sectionId: string
	}[]
}

// キャッシュの型を修正
interface ResourceCacheEntry {
	sections: Section[]
	resources: {
		id: string
		title: string
		description: string | null
		url: string
		faviconUrl: string | null
		mimeType: string | null
		isGoogleDrive: boolean
		position: number
		sectionId: string
	}[]
	timestamp: number
	isPreloaded?: boolean
}

interface PersistedState {
	sections: Section[]
	resources: ResourceStore['resources']
	resourceCache: Record<string, ResourceCacheEntry>
}

export interface ResourceStore {
	sections: Section[]
	resources: {
		id: string
		title: string
		description: string | null
		url: string
		faviconUrl: string | null
		mimeType: string | null
		isGoogleDrive: boolean
		position: number
		sectionId: string
	}[]
	driveFiles: DriveFile[]
	isLoading: boolean
	isCreating: boolean
	setIsCreating: (creating: boolean) => void
	setSections: (sections: Section[]) => void
	setIsLoading: (loading: boolean) => void
	fetchSections: (spaceId: string) => Promise<SectionData>
	createSection: (spaceId: string) => Promise<Section>
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

	createResource: (data: {
		title: string
		url: string
		faviconUrl: string | null
		sectionId: string
		position: number
	}) => Promise<ResourceStore['resources'][0]>

	prefetchResourceData: (spaceId: string) => Promise<void>
}

export const useResourceStore = create<ResourceStore>()(
	persist(
		devtools((set, get) => ({
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
				set({ isLoading: true })
				if (!spaceId) return { sections: [], resources: [] }
				try {
					const response = await fetch(`/api/spaces/${spaceId}/sections`)
					if (!response.ok) throw new Error('Failed to fetch sections')
					const data = await response.json()
					const formattedData = {
						sections: data.sections || [],
						resources: data.resources || [],
					}
					set({
						sections: formattedData.sections,
						resources: formattedData.resources,
						isLoading: false,
					})
					return formattedData
				} catch (error) {
					console.error('Error fetching sections:', error)
					set({ sections: [], resources: [], isLoading: false })
					throw error
				}
			},

			createSection: async (spaceId) => {
				const { sections, setIsCreating, setIsLoading } = get()

				try {
					setIsCreating(true)
					setIsLoading(true)

					const tempSection: Section = {
						id: `temp-${Date.now()}`,
						name: 'Resources',
						order: sections.length,
						spaceId: spaceId,
						createdAt: new Date(),
						updatedAt: new Date(),
						resources: [],
					}

					// 楽観的更新
					const updatedSections = [...sections, tempSection]
					set({ sections: updatedSections })

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
						// エラー時は元の状態に戻す
						set({ sections: sections })
						throw new Error('セクションの作成に失敗しました')
					}

					const newSection = await response.json()

					// 新しいセクションで状態を更新
					const finalSections = sections.filter((s) => s.id !== tempSection.id)
					const finalUpdatedSections = [...finalSections, newSection]
					set({ sections: finalUpdatedSections })

					// キャッシュの更新
					const cache = get().resourceCache.get(spaceId)
					if (cache) {
						get().resourceCache.set(spaceId, {
							...cache,
							sections: finalUpdatedSections,
							timestamp: Date.now(),
						})
					}

					return newSection
				} catch (error) {
					console.error('セクション作成エラー:', error)
					throw error instanceof Error
						? error
						: new Error('セクション作成に失敗しました')
				} finally {
					setIsCreating(false)
					setIsLoading(false)
				}
			},

			deleteSection: async (sectionId: string) => {
				const { sections, resources } = get()

				try {
					// APIリクエストを実行
					const response = await fetch(`/api/sections/${sectionId}`, {
						method: 'DELETE',
						credentials: 'include',
					})

					if (!response.ok) {
						if (response.status === 404) {
							// 既に削除されている場合は、ローカルの状態だけを更新
							set({
								sections: sections.filter(
									(section) => section.id !== sectionId,
								),
								resources: resources.filter(
									(resource) => resource.sectionId !== sectionId,
								),
							})
							return
						}
						throw new Error('セクションの削除に失敗しました')
					}

					// 成功した場合、状態を更新
					set({
						sections: sections.filter((section) => section.id !== sectionId),
						resources: resources.filter(
							(resource) => resource.sectionId !== sectionId,
						),
					})
				} catch (error) {
					console.error('セクション削除エラー:', error)
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
					| ((prev: ResourceStore['resources']) => ResourceStore['resources']),
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
				const targetResource = resources.find((r) => r.id === id)

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

					// キャッシュの無効化
					if (targetResource?.sectionId) {
						const section = get().sections.find(
							(s) => s.id === targetResource.sectionId,
						)
						if (section?.spaceId) {
							// キャッシュの更新
							const cache = get().resourceCache.get(section.spaceId)
							if (cache) {
								get().resourceCache.set(section.spaceId, {
									...cache,
									resources: cache.resources.filter((r) => r.id !== id),
									timestamp: Date.now(),
								})
							}

							// サーバーサイドのキャッシュも無効化
							await fetch('/api/revalidate?tag=resources', { method: 'POST' })
						}
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
					| ((prev: ResourceStore['resources']) => ResourceStore['resources']),
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

					// キャッシュを無効化
					await fetch('/api/revalidate?tag=resources', { method: 'POST' })
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
				const cache = get().resourceCache.get(spaceId)
				if (cache && Date.now() - cache.timestamp < get().CACHE_EXPIRY) {
					return
				}

				try {
					const response = await fetch(`/api/spaces/${spaceId}/sections`)
					const data = await response.json()

					get().resourceCache.set(spaceId, {
						sections: data.sections,
						resources: data.resources,
						timestamp: Date.now(),
						isPreloaded: true,
					})
				} catch (error) {
					console.error('Prefetch error:', error)
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
				const { sections } = get()
				const previousSections = [...sections]

				try {
					const targetSection = sections.find(
						(section) => section.id === sectionId,
					)
					if (!targetSection) {
						throw new Error('セクションが見つかりません')
					}

					const updatedSections = sections.map((section) =>
						section.id === sectionId ? { ...section, ...data } : section,
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
						const cache = get().resourceCache.get(spaceId)
						if (cache) {
							get().resourceCache.set(spaceId, {
								...cache,
								sections: updatedSections,
								timestamp: Date.now(),
							})
						}
					}
				} catch (error) {
					console.error('Section update error:', error)
					set({ sections: previousSections })
					throw error
				}
			},

			createResource: async (data: {
				title: string
				url: string
				faviconUrl: string | null
				sectionId: string
				position: number
			}) => {
				const { resources } = get()

				try {
					const response = await fetch('/api/resources', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(data),
					})

					if (!response.ok) {
						throw new Error('Failed to create resource')
					}

					const newResource = await response.json()
					set({ resources: [...resources, newResource] })
					return newResource
				} catch (error) {
					console.error('Error creating resource:', error)
					throw error
				}
			},

			prefetchResourceData: async (spaceId: string) => {
				const cache = get().resourceCache.get(spaceId)
				if (cache && Date.now() - cache.timestamp < get().CACHE_EXPIRY) {
					return // キャッシュが有効な場合は早期リターン
				}

				try {
					const response = await fetch(`/api/spaces/${spaceId}/sections`)
					if (!response.ok) throw new Error('Failed to fetch resources')

					const data = await response.json()

					// キャッシュのみを更新し、現在の表示は変更しない
					get().resourceCache.set(spaceId, {
						sections: data.sections,
						resources: data.resources,
						timestamp: Date.now(),
					})
				} catch (error) {
					console.error('Error prefetching resources:', error)
				}
			},
		})),

		{
			name: 'resource-storage',
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				sections: state.sections,
				resources: state.resources,
				resourceCache: Object.fromEntries(state.resourceCache),
			}),
			merge: (persistedState: unknown, currentState: ResourceStore) => {
				const typedState = persistedState as PersistedState
				return {
					...currentState,
					...typedState,
					resourceCache: new Map(
						Object.entries(typedState.resourceCache || {}),
					),
				}
			},
		},
	),
)
