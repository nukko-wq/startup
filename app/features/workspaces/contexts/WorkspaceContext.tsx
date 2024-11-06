'use client'

import { createContext, useContext, useState } from 'react'
import type { Workspace } from '@/app/types/workspace'

type WorkspaceContextType = {
	workspaces: Workspace[]
	setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>
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

	return (
		<WorkspaceContext.Provider value={{ workspaces, setWorkspaces }}>
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
