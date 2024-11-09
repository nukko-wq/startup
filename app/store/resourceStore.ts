import { create } from 'zustand'
import type { Resource } from '@prisma/client'
import type { Section } from '@/app/types/section'

interface ResourceStore {
	sections: Section[]
	isLoading: boolean
	isCreating: boolean
	setIsCreating: (creating: boolean) => void
	setSections: (sections: Section[]) => void
	setIsLoading: (loading: boolean) => void
	fetchSections: (spaceId: string) => Promise<void>
	createSection: (spaceId: string) => Promise<void>
	deleteSection: (sectionId: string) => void
	reorderSections: (items: Section[]) => Promise<void>
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
	sections: [],
	isLoading: false,
	isCreating: false,

	setIsCreating: (creating) => set({ isCreating: creating }),
	setSections: (sections) => set({ sections }),
	setIsLoading: (loading) => set({ isLoading: loading }),

	fetchSections: async (spaceId) => {
		try {
			set({ isLoading: true })
			const response = await fetch(`/api/spaces/${spaceId}/sections`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
				cache: 'no-store',
			})

			if (!response.ok) {
				throw new Error('Failed to fetch sections')
			}

			const data = await response.json()
			set({ sections: data.sections })
		} catch (error) {
			console.error('Error fetching sections:', error)
		} finally {
			set({ isLoading: false })
		}
	},

	createSection: async (spaceId) => {
		const { sections, setIsCreating } = get()
		setIsCreating(true)

		try {
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
				const error = await response.json()
				throw new Error(error.message || 'Failed to create section')
			}

			const newSection = await response.json()
			set({ sections: [...sections, newSection] })
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
	},

	deleteSection: (sectionId) => {
		set((state) => ({
			sections: state.sections.filter((section) => section.id !== sectionId),
		}))
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
}))
