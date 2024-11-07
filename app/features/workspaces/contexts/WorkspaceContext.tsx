'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Workspace } from '@/app/types/workspace'

type ReorderWorkspacesPayload = {
	items: Array<{ id: string; order: number }>
}

type WorkspaceContextType = {
	workspaces: Workspace[]
	setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>
	defaultWorkspace: Workspace | null
	reorderWorkspaces: (payload: ReorderWorkspacesPayload) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
	undefined,
)

export function WorkspaceProvider({
	children,
	initialWorkspaces,
}: {
	children: React.ReactNode
	initialWorkspaces: Workspace[]
}) {
	const [workspaces, setWorkspaces] = useState(initialWorkspaces)
	const [defaultWorkspace, setDefaultWorkspace] = useState<Workspace | null>(
		null,
	)

	const reorderWorkspaces = async (payload: ReorderWorkspacesPayload) => {
		try {
			const response = await fetch('/api/workspaces/reorder', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'ワークスペースの並び替えに失敗しました')
			}

			if (!data.success) {
				throw new Error(data.error || 'ワークスペースの並び替えに失敗しました')
			}

			// 更新されたワークスペースで状態を更新
			if (data.data) {
				setWorkspaces(data.data)
			}

			return data
		} catch (error) {
			console.error('ワークスペースの並び替えに失敗しました:', error)
			throw error
		}
	}

	useEffect(() => {
		const fetchDefaultWorkspace = async () => {
			try {
				const response = await fetch('/api/workspaces/default')
				if (!response.ok)
					throw new Error('デフォルトワークスペースの取得に失敗しました')
				const data = await response.json()
				setDefaultWorkspace(data)
			} catch (error) {
				console.error('デフォルトワークスペースの取得に失敗しました:', error)
			}
		}
		fetchDefaultWorkspace()
	}, [])

	return (
		<WorkspaceContext.Provider
			value={{ workspaces, setWorkspaces, defaultWorkspace, reorderWorkspaces }}
		>
			{children}
		</WorkspaceContext.Provider>
	)
}

export function useWorkspaces() {
	const context = useContext(WorkspaceContext)
	if (!context) {
		throw new Error('useWorkspaces must be used within a WorkspaceProvider')
	}
	return context
}
