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
		const response = await fetch('/api/workspaces/reorder', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		})

		if (!response.ok) {
			throw new Error('ワークスペースの並び替えに失敗しました')
		}

		const data = await response.json()
		if (!data.success) {
			throw new Error(data.error || 'ワークスペースの並び替えに失敗しました')
		}

		// APIからの応答で最終的な状態を更新（必要な場合のみ）
		if (data.data) {
			setWorkspaces(data.data)
		}
	}

	useEffect(() => {
		const fetchDefaultWorkspace = async () => {
			try {
				const response = await fetch('/api/workspaces/default')
				if (!response.ok) {
					throw new Error('デフォルトワークスペースの取得に失敗しました')
				}
				const data = await response.json()
				if (data.success && data.data) {
					setDefaultWorkspace(data.data)
				} else {
					throw new Error(
						data.error || 'デフォルトワークスペースの取得に失敗しました',
					)
				}
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
