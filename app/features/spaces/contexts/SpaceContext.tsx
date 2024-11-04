'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { Space } from '@/app/types/space'
import { useSearchParams } from 'next/navigation'

type SpaceContextType = {
	spaces: Space[]
	setSpaces: React.Dispatch<React.SetStateAction<Space[]>>
	reorderSpaces: (newSpaces: Space[]) => Promise<void>
	activeSpaceId?: string
	setActiveSpaceId: React.Dispatch<React.SetStateAction<string | undefined>>
	isNavigating: boolean
	setIsNavigating: React.Dispatch<React.SetStateAction<boolean>>
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined)

export function SpaceProvider({
	children,
	initialSpaces,
	initialActiveSpaceId,
}: {
	children: React.ReactNode
	initialSpaces: Space[]
	initialActiveSpaceId?: string
}) {
	const [spaces, setSpaces] = useState(initialSpaces)
	const [activeSpaceId, setActiveSpaceId] = useState(initialActiveSpaceId)
	const searchParams = useSearchParams()
	const [isNavigating, setIsNavigating] = useState(false)
	const previousSpaceId = useRef<string | null>(null)

	// URLのspaceIdパラメータとactiveSpaceIdの同期
	useEffect(() => {
		const spaceId = searchParams.get('spaceId')
		if (!isNavigating && spaceId && spaceId !== activeSpaceId) {
			console.log('Updating activeSpaceId from URL:', spaceId)
			previousSpaceId.current = activeSpaceId || null
			setActiveSpaceId(spaceId)
		}
	}, [searchParams, isNavigating, activeSpaceId])

	// isNavigatingの制御
	useEffect(() => {
		if (isNavigating) {
			const timer = setTimeout(() => {
				setIsNavigating(false)
				previousSpaceId.current = null
			}, 300) // タイムアウトを少し長めに
			return () => clearTimeout(timer)
		}
	}, [isNavigating])

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

	const value = {
		spaces,
		setSpaces,
		reorderSpaces,
		activeSpaceId,
		setActiveSpaceId,
		isNavigating,
		setIsNavigating,
	}

	return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>
}

export function useSpaces() {
	const context = useContext(SpaceContext)
	if (!context) {
		throw new Error('useSpaces must be used within a SpaceProvider')
	}
	return context
}
