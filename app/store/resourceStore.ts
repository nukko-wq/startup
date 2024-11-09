import { create } from 'zustand'
import type { Resource } from '@prisma/client'
import type { Section } from '@/app/types/section'

export interface DriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
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
	fetchSections: (spaceId: string) => Promise<void>
	createSection: (spaceId: string) => Promise<void>
	deleteSection: (sectionId: string) => void
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
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
	sections: [],
	resources: [],
	driveFiles: [],
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

		try {
			set({ resources: resources.filter((resource) => resource.id !== id) })

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
}))
