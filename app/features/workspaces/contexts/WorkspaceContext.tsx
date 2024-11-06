'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Workspace } from '@/app/types/workspace'

type WorkspaceContextType = {
	workspaces: Workspace[]
	setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>
	defaultWorkspace: Workspace | null
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
			value={{ workspaces, setWorkspaces, defaultWorkspace }}
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
