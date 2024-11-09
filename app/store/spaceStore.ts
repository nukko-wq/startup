import { create } from 'zustand'
import type { Space } from '@/app/types/space'

interface SpaceStore {
	spaces: Space[]
	activeSpaceId: string | null
	currentSpace: Space | null
	isLoading: boolean
	isNavigating: boolean
	setSpaces: (spaces: Space[]) => void
	setActiveSpaceId: (id: string | null) => void
	setCurrentSpace: (space: Space | null) => void
	setIsLoading: (loading: boolean) => void
	setIsNavigating: (navigating: boolean) => void
	handleSpaceClick: (spaceId: string) => Promise<void>
	reorderSpaces: (newSpaces: Space[]) => Promise<void>
}

export const useSpaceStore = create<SpaceStore>((set, get) => ({
	spaces: [],
	activeSpaceId: null,
	currentSpace: null,
	isLoading: true,
	isNavigating: false,

	setSpaces: (spaces) => set({ spaces }),
	setActiveSpaceId: (id) => set({ activeSpaceId: id }),
	setCurrentSpace: (space) => set({ currentSpace: space }),
	setIsLoading: (loading) => set({ isLoading: loading }),
	setIsNavigating: (navigating) => set({ isNavigating: navigating }),

	handleSpaceClick: async (spaceId) => {
		const { setIsLoading, setIsNavigating, setActiveSpaceId, spaces } = get()

		try {
			setIsLoading(true)
			setIsNavigating(true)
			setActiveSpaceId(spaceId)

			const space = spaces.find((s) => s.id === spaceId)
			if (space) {
				set({ currentSpace: space })
			}

			await fetch('/api/users/last-active-space', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spaceId }),
			})
		} catch (error) {
			console.error('Error switching space:', error)
		} finally {
			setTimeout(() => {
				setIsNavigating(false)
				setIsLoading(false)
			}, 500)
		}
	},

	reorderSpaces: async (newSpaces) => {
		const { setSpaces, spaces: previousSpaces } = get()

		try {
			setSpaces(newSpaces)

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
}))
