'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Resource } from '@prisma/client'
import type { Section } from '@/app/types/section'

interface DriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
}

type ResourceContextType = {
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
	setResources: React.Dispatch<
		React.SetStateAction<ResourceContextType['resources']>
	>
	driveFiles: DriveFile[]
	setDriveFiles: React.Dispatch<React.SetStateAction<DriveFile[]>>
	removeResource: (id: string) => Promise<void>
	updateResource: (
		id: string,
		data: Partial<ResourceContextType['resources'][0]>,
	) => Promise<void>
	addResource: ((
		resource: ResourceContextType['resources'][0],
	) => Promise<void>) &
		((
			updater: (
				prev: ResourceContextType['resources'],
			) => ResourceContextType['resources'],
		) => Promise<void>)
	reorderResources: (
		newResources: ResourceContextType['resources'],
	) => Promise<void>
	updateAllResources: (newResources: ResourceContextType['resources']) => void
}

const ResourceContext = createContext<ResourceContextType | undefined>(
	undefined,
)

export function ResourceProvider({
	children,
	initialResources,
	sections,
}: {
	children: React.ReactNode
	initialResources: ResourceContextType['resources']
	sections: Section[]
}) {
	const [resources, setResources] = useState(() =>
		initialResources.sort((a, b) => {
			if (a.sectionId === b.sectionId) {
				return a.position - b.position
			}
			const sectionAIndex = sections.findIndex((s) => s.id === a.sectionId)
			const sectionBIndex = sections.findIndex((s) => s.id === b.sectionId)
			return sectionAIndex - sectionBIndex
		}),
	)
	const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])

	useEffect(() => {
		setResources((prev) =>
			[...prev].sort((a, b) => {
				if (a.sectionId === b.sectionId) {
					return a.position - b.position
				}
				const sectionAIndex = sections.findIndex((s) => s.id === a.sectionId)
				const sectionBIndex = sections.findIndex((s) => s.id === b.sectionId)
				return sectionAIndex - sectionBIndex
			}),
		)
	}, [sections])

	const removeResource = async (id: string) => {
		const previousResources = [...resources]
		setResources((prev) => prev.filter((resource) => resource.id !== id))

		try {
			const response = await fetch(`/api/resources/${id}`, {
				method: 'DELETE',
			})
			if (!response.ok) {
				throw new Error('Failed to delete resource')
			}
		} catch (error) {
			setResources(previousResources)
			throw error
		}
	}

	const updateResource = async (
		id: string,
		data: Partial<ResourceContextType['resources'][0]>,
	) => {
		const previousResources = [...resources]
		setResources((prev) =>
			prev.map((resource) =>
				resource.id === id ? { ...resource, ...data } : resource,
			),
		)

		try {
			const response = await fetch(`/api/resources/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})
			if (!response.ok) {
				throw new Error('Failed to update resource')
			}
		} catch (error) {
			setResources(previousResources)
			throw error
		}
	}

	const addResource = async (
		resourceOrUpdater:
			| ResourceContextType['resources'][0]
			| ((
					prev: ResourceContextType['resources'],
			  ) => ResourceContextType['resources']),
	) => {
		if (typeof resourceOrUpdater === 'function') {
			setResources(resourceOrUpdater)
			return
		}

		setResources((prev) => [...prev, resourceOrUpdater])
	}

	const reorderResources = async (
		newResources: ResourceContextType['resources'],
	) => {
		const previousResources = [...resources]

		try {
			// 更新前にステート更新
			setResources(newResources)

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

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.message || 'Failed to reorder resources')
			}

			return result
		} catch (error) {
			console.error('Reorder error:', error)
			setResources(previousResources)
			throw error
		}
	}

	const updateAllResources = (
		newResources: ResourceContextType['resources'],
	) => {
		setResources(
			newResources.sort((a, b) => {
				if (a.sectionId === b.sectionId) {
					return a.position - b.position
				}
				return 0
			}),
		)
	}

	return (
		<ResourceContext.Provider
			value={{
				resources,
				setResources,
				driveFiles,
				setDriveFiles,
				removeResource,
				updateResource,
				addResource,
				reorderResources,
				updateAllResources,
			}}
		>
			{children}
		</ResourceContext.Provider>
	)
}

export function useResources() {
	const context = useContext(ResourceContext)
	if (context === undefined) {
		throw new Error('useResources must be used within a ResourceProvider')
	}
	return context
}
