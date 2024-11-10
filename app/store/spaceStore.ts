import { create } from 'zustand'
import type { Space } from '@/app/types/space'
import { useResourceStore } from '@/app/store/resourceStore'
import type { useRouter } from 'next/navigation'
import type { Section, Resource } from '@/app/types/section'

export interface SpaceStore {
	spaces: Space[]
	activeSpaceId: string | null
	currentSpace: Space | null
	isLoading: boolean
	isNavigating: boolean
	isDragging: boolean
	setSpaces: (spaces: Space[]) => void
	setActiveSpaceId: (id: string | null) => void
	setCurrentSpace: (space: Space | null) => void
	setIsLoading: (loading: boolean) => void
	setIsNavigating: (navigating: boolean) => void
	setIsDragging: (dragging: boolean) => void
	initializeSpaces: (initialSpaces: Space[], activeSpaceId?: string) => void
	handleSpaceClick: (
		spaceId: string,
		router: ReturnType<typeof useRouter>,
	) => Promise<void>
	reorderSpaces: (newSpaces: Space[]) => Promise<void>
	updateSpaceWorkspace: (
		spaceId: string,
		workspaceId: string,
		newOrder: number,
	) => Promise<void>
	updateSpaceName: (spaceId: string, name: string) => Promise<void>
}

export const useSpaceStore = create<SpaceStore>((set, get) => ({
	spaces: [],
	activeSpaceId: null,
	currentSpace: null,
	isLoading: true,
	isNavigating: false,
	isDragging: false,

	setSpaces: (spaces: Space[]) => set({ spaces }),
	setActiveSpaceId: (id) => set({ activeSpaceId: id }),
	setCurrentSpace: (space) => set({ currentSpace: space }),
	setIsLoading: (loading) => set({ isLoading: loading }),
	setIsNavigating: (navigating) => set({ isNavigating: navigating }),
	setIsDragging: (dragging) => set({ isDragging: dragging }),

	initializeSpaces: (initialSpaces, activeSpaceId) => {
		set({
			spaces: initialSpaces,
			isLoading: false,
		})

		if (activeSpaceId) {
			const activeSpace = initialSpaces.find(
				(space) => space.id === activeSpaceId,
			)
			if (activeSpace) {
				set({
					activeSpaceId: activeSpace.id,
					currentSpace: activeSpace,
				})
			}
		} else {
			const lastActiveSpace = initialSpaces.find((space) => space.isLastActive)
			if (lastActiveSpace) {
				set({
					activeSpaceId: lastActiveSpace.id,
					currentSpace: lastActiveSpace,
				})
			}
		}
	},

	handleSpaceClick: async (spaceId, router) => {
		const { setIsNavigating, setActiveSpaceId, spaces } = get()
		const resourceStore = useResourceStore.getState()

		try {
			setIsNavigating(true)

			// 現在のスペースのデータを保存
			const currentSpaceId = get().activeSpaceId
			if (currentSpaceId) {
				queueMicrotask(() => {
					sessionStorage.setItem(
						`sections-${currentSpaceId}`,
						JSON.stringify({
							sections: resourceStore.sections,
							resources: resourceStore.resources,
						}),
					)
				})
			}

			// 新しいスペースのデータを事前に準備
			const cache = resourceStore.resourceCache.get(spaceId)
			const cachedData = sessionStorage.getItem(`sections-${spaceId}`)
			const prefetchedData = resourceStore.prefetchedSections[spaceId]

			// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
			let dataToUse
			if (cache) {
				dataToUse = cache
			} else if (cachedData) {
				dataToUse = JSON.parse(cachedData)
			} else if (prefetchedData) {
				dataToUse = {
					sections: prefetchedData,
					resources: resourceStore.prefetchedResources[spaceId],
				}
			}

			// トランザクション的に状態を更新
			if (dataToUse) {
				await Promise.resolve() // マイクロタスクを作成して状態更新を同期化
				resourceStore.setSections(dataToUse.sections)
				resourceStore.setResources(dataToUse.resources)
			}

			// スペースの状態を更新
			const space = spaces.find((s) => s.id === spaceId)
			if (space) {
				set({ currentSpace: space })
				setActiveSpaceId(spaceId)
			}

			// URLの更新とデータ取得を並行実行
			const [newData] = await Promise.all([
				resourceStore.fetchSections(spaceId) as unknown as Promise<{
					sections: Section[]
					resources: Resource[]
				}>,
				router.replace(`/?spaceId=${spaceId}`, { scroll: false }),
			])

			// 新しいデータがある場合のみ更新
			if (newData?.sections && newData?.resources) {
				resourceStore.setSections(newData.sections)
				resourceStore.setResources(newData.resources)
			}
		} catch (error) {
			console.error('Error switching space:', error)
		} finally {
			setIsNavigating(false)
		}
	},

	reorderSpaces: async (newSpaces) => {
		const { setSpaces, spaces: previousSpaces } = get()

		try {
			// 新しい配列を作成して順序を更新
			const updatedSpaces = [...previousSpaces]
			for (const newSpace of newSpaces) {
				const index = updatedSpaces.findIndex((s) => s.id === newSpace.id)
				if (index !== -1) {
					updatedSpaces[index] = {
						...updatedSpaces[index],
						order: newSpace.order,
					}
				}
			}

			// 重複を避けるため、一意のIDでソート
			const uniqueSpaces = Array.from(
				new Map(updatedSpaces.map((space) => [space.id, space])).values(),
			).sort((a, b) => a.order - b.order)

			setSpaces(uniqueSpaces)

			const response = await fetch('/api/spaces/reorder', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: uniqueSpaces.map((space) => ({
						id: space.id,
						order: space.order,
					})),
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to reorder spaces')
			}
		} catch (error) {
			console.error('Reorder error:', error)
			setSpaces(previousSpaces)
		}
	},

	updateSpaceWorkspace: async (spaceId, workspaceId, newOrder) => {
		const { spaces, setSpaces } = get()
		const previousSpaces = [...spaces]

		try {
			// 一度に状態を更新
			const updatedSpaces = spaces
				.map((space) => {
					if (space.id === spaceId) {
						return { ...space, workspaceId, order: newOrder }
					}
					// 同じワークスペース内の他のスペースの順序を調整
					if (space.workspaceId === workspaceId && space.order >= newOrder) {
						return { ...space, order: space.order + 1 }
					}
					return space
				})
				.sort((a, b) => a.order - b.order)

			// 重複を避けるため、一意のIDでフィルタリング
			const uniqueSpaces = Array.from(
				new Map(updatedSpaces.map((space) => [space.id, space])).values(),
			)

			setSpaces(uniqueSpaces)

			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					workspaceId,
					order: newOrder,
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to update space workspace')
			}
		} catch (error) {
			console.error('Update workspace error:', error)
			setSpaces(previousSpaces)
		}
	},

	updateSpaceName: async (spaceId: string, name: string) => {
		const { spaces, setSpaces, currentSpace, setCurrentSpace } = get()
		const previousSpaces = [...spaces]
		const previousCurrentSpace = currentSpace

		try {
			// 楽観的な更新
			const updatedSpaces = spaces.map((space) =>
				space.id === spaceId ? { ...space, name } : space,
			)
			setSpaces(updatedSpaces)

			// currentSpaceも更新
			if (currentSpace && currentSpace.id === spaceId) {
				setCurrentSpace({ ...currentSpace, name })
			}

			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name }),
			})

			if (!response.ok) {
				throw new Error('Failed to update space name')
			}
		} catch (error) {
			// エラー時に元の状態に戻す
			setSpaces(previousSpaces)
			setCurrentSpace(previousCurrentSpace)
			throw error
		}
	},
}))
