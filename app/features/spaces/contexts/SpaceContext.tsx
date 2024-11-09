'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { Space } from '@/app/types/space'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface SpaceContextType {
	spaces: Space[]
	setSpaces: React.Dispatch<React.SetStateAction<Space[]>>
	reorderSpaces: (newSpaces: Space[]) => Promise<void>
	activeSpaceId: string | null
	setActiveSpaceId: React.Dispatch<React.SetStateAction<string | null>>
	isNavigating: boolean
	setIsNavigating: React.Dispatch<React.SetStateAction<boolean>>
	handleSpaceClick: (spaceId: string) => Promise<void>
	currentSpace: Space | null
	setCurrentSpace: (space: Space) => void
}

export const SpaceContext = createContext<SpaceContextType>({
	spaces: [],
	setSpaces: () => {},
	reorderSpaces: async () => {},
	activeSpaceId: null,
	setActiveSpaceId: () => {},
	isNavigating: false,
	setIsNavigating: () => {},
	handleSpaceClick: async () => {},
	currentSpace: null,
	setCurrentSpace: () => {},
})

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
	const [activeSpaceId, setActiveSpaceId] = useState<string | null>(
		initialActiveSpaceId ?? null,
	)
	const searchParams = useSearchParams()
	const [isNavigating, setIsNavigating] = useState(false)
	const router = useRouter()
	const lastUpdateSource = useRef<'url' | 'click' | null>(null)
	const pendingUpdate = useRef<string | null>(null)
	const [currentSpace, setCurrentSpace] = useState<Space | null>(null)

	// activeSpaceIdが変更されたときにcurrentSpaceを更新
	useEffect(() => {
		if (activeSpaceId) {
			const space = spaces.find((space) => space.id === activeSpaceId)
			if (space) {
				setCurrentSpace(space)
			}
		}
	}, [activeSpaceId, spaces])

	// currentSpaceを更新する関数
	const updateCurrentSpace = (space: Space) => {
		setCurrentSpace((prev) => {
			const updatedSpace = { ...prev, ...space }
			setSpaces((prevSpaces) =>
				prevSpaces.map((s) => (s.id === space.id ? updatedSpace : s)),
			)
			return updatedSpace
		})
	}

	// URLのspaceIdパラメータとactiveSpaceIdの同期
	useEffect(() => {
		const spaceId = searchParams.get('spaceId')

		// isNavigatingがtrueの間は同期処理をスキップ
		if (isNavigating) return

		if (
			spaceId &&
			spaceId !== activeSpaceId &&
			lastUpdateSource.current !== 'click' &&
			pendingUpdate.current !== spaceId &&
			spaces.some((space) => space.id === spaceId)
		) {
			lastUpdateSource.current = 'url'
			pendingUpdate.current = spaceId
			setActiveSpaceId(spaceId)
		}
	}, [searchParams, isNavigating, activeSpaceId, spaces])

	// activeSpaceIdが変更されたときの処理
	useEffect(() => {
		if (activeSpaceId && lastUpdateSource.current) {
			const timer = setTimeout(() => {
				lastUpdateSource.current = null
				pendingUpdate.current = null
			}, 500) // タイマーを500msに延長
			return () => clearTimeout(timer)
		}
	}, [activeSpaceId])

	const reorderSpaces = async (newSpaces: Space[]) => {
		const previousSpaces = [...spaces]

		try {
			// フロントエンドの状態を即座に更新
			setSpaces(newSpaces)

			const payload = {
				items: newSpaces.map((space) => ({
					id: space.id,
					order: space.order,
				})),
			}

			const response = await fetch('/api/spaces/reorder', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.error || 'Failed to reorder spaces')
			}
		} catch (error) {
			console.error('Reorder error:', error)
			// エラー時は元の状態に戻す
			setSpaces(previousSpaces)
			throw error
		}
	}

	const handleSpaceSelect = async (spaceId: string) => {
		try {
			await fetch('/api/users/last-active-space', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spaceId }),
			})
		} catch (error) {
			console.error('Error updating last active space:', error)
		}
	}

	const handleSpaceClick = async (spaceId: string) => {
		try {
			// まず状態を更新
			setIsNavigating(true)
			lastUpdateSource.current = 'click'
			setActiveSpaceId(spaceId)

			// 状態の更新が確実に完了するまで待機
			await new Promise((resolve) => setTimeout(resolve, 100))

			// その後でナビゲーションと他の処理を実行
			await Promise.all([
				router.push(`/?spaceId=${spaceId}`, { scroll: false }),
				handleSpaceSelect(spaceId),
			])
		} catch (error) {
			console.error('Error switching space:', error)
		} finally {
			// クリーンアップは少し遅延させる
			setTimeout(() => {
				setIsNavigating(false)
				lastUpdateSource.current = null
				pendingUpdate.current = null
			}, 500)
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
		handleSpaceClick,
		currentSpace,
		setCurrentSpace: updateCurrentSpace,
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
