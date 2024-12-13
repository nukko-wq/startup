export interface Space {
	id: string
	name: string
	order: number
	workspaceId: string
	isLastActive: boolean
}

export interface SpaceState {
	spaces: Space[]
	activeSpaceId: string | null
	loading: boolean
	error: string | null
}
