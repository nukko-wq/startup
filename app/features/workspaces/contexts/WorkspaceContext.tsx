'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Workspace } from '@/app/types/workspace'

type WorkspaceContextType = {
	workspaces: Workspace[]
	setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>
	defaultWorkspace: Workspace | null
	reorderWorkspaces: (newWorkspaces: Workspace[]) => Promise<void>
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

	const reorderWorkspaces = async (newWorkspaces: Workspace[]) => {
		try {
			const items = newWorkspaces.map((workspace) => ({
				id: workspace.id,
				order: workspace.order,
			}))

			const response = await fetch('/api/workspaces/reorder', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ items }),
			})

			if (!response.ok) {
				throw new Error('Failed to reorder workspaces')
			}

			setWorkspaces(newWorkspaces)
		} catch (error) {
			console.error('Reorder error:', error)
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
				console.error('Error fetching default workspace:', error)
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
