export interface Space {
	id: string
	name: string
	order: number
	workspaceId: string
	isLastActive: boolean
	isDefault: boolean
}

export interface SpaceState {
	spaces: Space[]
	activeSpaceId: string | null
	loading: boolean
	error: string | null
	optimisticSpaces: Space[]
}
