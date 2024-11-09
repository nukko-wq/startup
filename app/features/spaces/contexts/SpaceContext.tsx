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
	isLoading: boolean
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
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
	isLoading: false,
	setIsLoading: () => {},
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
	const [isLoading, setIsLoading] = useState(true)
	const spaceCache = useRef<Map<string, Space>>(new Map())
	const navigationLock = useRef<boolean>(false)

	// 初期データのロード完了時にローディングを解除
	useEffect(() => {
		if (initialSpaces.length > 0) {
			setIsLoading(false)
		}
	}, [initialSpaces])

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

			// 状態更新を遅延させて実行
			setTimeout(() => {
				setActiveSpaceId(spaceId)
			}, 0)
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
		if (navigationLock.current) return
		try {
			navigationLock.current = true
			setIsLoading(true)
			setIsNavigating(true)
			lastUpdateSource.current = 'click'

			// キャッシュに保存
			const targetSpace = spaces.find((space) => space.id === spaceId)
			if (targetSpace) {
				spaceCache.current.set(spaceId, targetSpace)
			}

			// 状態を一括更新（同期的に実行）
			setActiveSpaceId(spaceId)
			if (targetSpace) {
				setCurrentSpace(targetSpace)
			}

			// ナビゲーション前に少し待機
			await new Promise((resolve) => setTimeout(resolve, 50))

			// ナビゲーションを実行
			await router.replace(`/?spaceId=${spaceId}`, { scroll: false })
			await handleSpaceSelect(spaceId)
		} catch (error) {
			console.error('Error switching space:', error)
		} finally {
			// 完了後にロックを解除（遅延を延長）
			setTimeout(() => {
				setIsNavigating(false)
				setIsLoading(false)
				lastUpdateSource.current = null
				pendingUpdate.current = null
				navigationLock.current = false
			}, 500)
		}
	}

	// URLとの同期処理を改善
	useEffect(() => {
		const spaceId = searchParams.get('spaceId')

		if (!spaceId || isNavigating || navigationLock.current) return

		const cachedSpace = spaceCache.current.get(spaceId)
		if (cachedSpace && cachedSpace.id !== activeSpaceId) {
			setActiveSpaceId(cachedSpace.id)
			setCurrentSpace(cachedSpace)
		}
	}, [searchParams, isNavigating, activeSpaceId])

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
		isLoading,
		setIsLoading,
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
