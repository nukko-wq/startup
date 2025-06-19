export interface Workspace {
	id: string
	name: string
	order: number
	isDefault: boolean
	userId: string
}

export interface WorkspaceState {
	workspaces: Workspace[]
	activeWorkspaceId: string | null
	loading: boolean
	error: string | null
}
