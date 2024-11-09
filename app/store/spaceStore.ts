import { create } from 'zustand'
import type { Space } from '@/app/types/space'
import { useResourceStore } from '@/app/store/resourceStore'
import type { useRouter } from 'next/navigation'

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
		const { setIsLoading, setIsNavigating, setActiveSpaceId, spaces } = get()
		const resourceStore = useResourceStore.getState()

		try {
			setIsNavigating(true)
			setIsLoading(true)

			// 新しいスペースのデータを先に確認
			const cacheKey = `sections-${spaceId}`
			const cachedData = sessionStorage.getItem(cacheKey)
			const hasPrefetchedData = resourceStore.prefetchedSections[spaceId]

			// 現在のスペースのデータを保存
			const currentSpaceId = get().activeSpaceId
			if (currentSpaceId) {
				sessionStorage.setItem(
					`sections-${currentSpaceId}`,
					JSON.stringify({
						sections: resourceStore.sections,
						resources: resourceStore.resources,
					}),
				)
			}

			// 新しいスペースの状態を設定
			const space = spaces.find((s) => s.id === spaceId)
			if (space) {
				set({ currentSpace: space })
				setActiveSpaceId(spaceId)
			}

			// データの設定を一括で行う
			if (cachedData) {
				const parsedData = JSON.parse(cachedData)
				await Promise.all([
					resourceStore.setSections(parsedData.sections),
					resourceStore.setResources(parsedData.resources),
					router.replace(`/?spaceId=${spaceId}`, { scroll: false }),
				])
			} else if (hasPrefetchedData) {
				await Promise.all([
					resourceStore.setSections(resourceStore.prefetchedSections[spaceId]),
					resourceStore.setResources(
						resourceStore.prefetchedResources[spaceId] || [],
					),
				])
			} else {
				// データがない場合は空の状態を表示
				resourceStore.setSections([])
				resourceStore.setResources([])
				setIsLoading(true)
			}

			// URLの更新とデータフェッチを並行して実行
			await Promise.all([
				!cachedData &&
					!hasPrefetchedData &&
					resourceStore.fetchSections(spaceId),
				router.replace(`/?spaceId=${spaceId}`, { scroll: false }),
				fetch('/api/users/last-active-space', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ spaceId }),
				}),
			])
		} catch (error) {
			console.error('Error switching space:', error)
		} finally {
			setIsNavigating(false)
			setIsLoading(false)
		}
	},

	reorderSpaces: async (newSpaces) => {
		const { setSpaces, spaces: previousSpaces } = get()

		try {
			setSpaces(newSpaces.sort((a, b) => a.order - b.order))

			const response = await fetch('/api/spaces/reorder', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: newSpaces.map((space) => ({
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
			const updatedSpaces = spaces.map((space) => {
				if (space.id === spaceId) {
					return { ...space, workspaceId, order: newOrder }
				}
				return space
			})

			setSpaces(updatedSpaces.sort((a, b) => a.order - b.order))

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
}))
