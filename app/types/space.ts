export interface Space {
	id: string
	name: string
	order: number
	userId: string
	workspaceId: string
	isLastActive?: boolean
	createdAt: Date
	updatedAt: Date
}
