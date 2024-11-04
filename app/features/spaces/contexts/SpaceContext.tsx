'use client'

import { createContext, useContext, useState } from 'react'
import type { Space } from '@/app/types/space'

type SpaceContextType = {
	spaces: Space[]
	setSpaces: React.Dispatch<React.SetStateAction<Space[]>>
	reorderSpaces: (newSpaces: Space[]) => Promise<void>
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined)

export function SpaceProvider({
	children,
	initialSpaces,
}: {
	children: React.ReactNode
	initialSpaces: Space[]
}) {
	const [spaces, setSpaces] = useState(initialSpaces)

	const reorderSpaces = async (newSpaces: Space[]) => {
		const previousSpaces = [...spaces]

		try {
			setSpaces(newSpaces)

			const payload = {
				items: newSpaces.map((item, index) => ({
					id: item.id,
					order: index,
				})),
			}

			const response = await fetch('/api/spaces/reorder', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				throw new Error('Failed to reorder spaces')
			}
		} catch (error) {
			console.error('Reorder error:', error)
			setSpaces(previousSpaces)
			throw error
		}
	}

	return (
		<SpaceContext.Provider value={{ spaces, setSpaces, reorderSpaces }}>
			{children}
		</SpaceContext.Provider>
	)
}

export function useSpaces() {
	const context = useContext(SpaceContext)
	if (!context) {
		throw new Error('useSpaces must be used within a SpaceProvider')
	}
	return context
}
