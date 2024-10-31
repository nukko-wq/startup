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
	removeResource: (id: string) => void
	updateResource: (
		id: string,
		data: Partial<ResourceContextType['resources'][0]>,
	) => void
	addResource: (resource: ResourceContextType['resources'][0]) => void
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

	const removeResource = (id: string) => {
		setResources((prev) => prev.filter((resource) => resource.id !== id))
	}

	const updateResource = (
		id: string,
		data: Partial<ResourceContextType['resources'][0]>,
	) => {
		setResources((prev) =>
			prev.map((resource) =>
				resource.id === id ? { ...resource, ...data } : resource,
			),
		)
	}

	const addResource = (resource: ResourceContextType['resources'][0]) => {
		setResources((prev) => [...prev, resource])
	}

	return (
		<ResourceContext.Provider
			value={{
				resources,
				setResources,
				removeResource,
				updateResource,
				addResource,
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
