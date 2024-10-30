'use client'

import { createContext, useContext, useState } from 'react'
import type { Resource } from '@prisma/client'

type ResourceContextType = {
	resources: Pick<
		Resource,
		'id' | 'title' | 'description' | 'url' | 'faviconUrl' | 'position'
	>[]
	setResources: React.Dispatch<
		React.SetStateAction<ResourceContextType['resources']>
	>
	removeResource: (id: string) => void
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

	return (
		<ResourceContext.Provider
			value={{ resources, setResources, removeResource }}
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
