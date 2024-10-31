'use client'

import { createContext, useContext, useState } from 'react'
import type { Resource } from '@prisma/client'

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
	>[]
	setResources: React.Dispatch<
		React.SetStateAction<ResourceContextType['resources']>
	>
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
}

const ResourceContext = createContext<ResourceContextType | undefined>(
	undefined,
)

export function ResourceProvider({
	children,
	initialResources,
}: {
	children: React.ReactNode
	initialResources: ResourceContextType['resources']
}) {
	const [resources, setResources] = useState(initialResources)

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
		const previousResources = [...resources]

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
		setResources(newResources)

		try {
			const payload = {
				items: newResources.map((item, index) => ({
					id: item.id,
					position: index + 1,
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
			setResources(previousResources)
			throw error
		}
	}

	return (
		<ResourceContext.Provider
			value={{
				resources,
				setResources,
				removeResource,
				updateResource,
				addResource,
				reorderResources,
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
