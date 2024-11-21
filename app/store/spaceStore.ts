import { create } from 'zustand'
import type { Space } from '@/app/types/space'
import { useResourceStore } from '@/app/store/resourceStore'
import type { useRouter } from 'next/navigation'
import type { Section, Resource } from '@/app/types/section'
import type { SectionData } from '@/app/store/resourceStore'

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
	isLoading: false,
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
		const { setIsNavigating, spaces, setCurrentSpace } = get()
		const resourceStore = useResourceStore.getState()

		try {
			setIsNavigating(true)

			const targetSpace = spaces.find((space) => space.id === spaceId)
			if (targetSpace) {
				setCurrentSpace(targetSpace)
			}

			const cachedData = resourceStore.resourceCache.get(spaceId)
			if (cachedData) {
				resourceStore.setSections(cachedData.sections)
				resourceStore.setResources(cachedData.resources)
			}

			await Promise.all([
				fetch(`/api/spaces/${spaceId}/active`, { method: 'PUT' }),
				router.replace(`/?spaceId=${spaceId}`, { scroll: false }),
			])

			if (!cachedData) {
				const data = await resourceStore.fetchSections(spaceId)
				resourceStore.setSections(data.sections)
				resourceStore.setResources(data.resources)
			}
		} catch (error) {
			console.error('Error in handleSpaceClick:', error)
		} finally {
			setIsNavigating(false)
		}
	},

	reorderSpaces: async (newSpaces) => {
		const { setSpaces, spaces: previousSpaces } = get()

		try {
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
			const updatedSpaces = spaces
				.map((space) => {
					if (space.id === spaceId) {
						return { ...space, workspaceId, order: newOrder }
					}
					if (space.workspaceId === workspaceId && space.order >= newOrder) {
						return { ...space, order: space.order + 1 }
					}
					return space
				})
				.sort((a, b) => a.order - b.order)

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
			const updatedSpaces = spaces.map((space) =>
				space.id === spaceId ? { ...space, name } : space,
			)
			setSpaces(updatedSpaces)

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
			setSpaces(previousSpaces)
			setCurrentSpace(previousCurrentSpace)
			throw error
		}
	},
}))
