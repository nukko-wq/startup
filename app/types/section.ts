export interface Resource {
	id: string
	title: string
	description: string
	url: string
	faviconUrl: string | null
	position: number
	mimeType: string | null
	isGoogleDrive: boolean
	sectionId: string
}

export interface Section {
	id: string
	name: string
	order: number
	createdAt: Date
	updatedAt: Date
	resources: Resource[]
	userId?: string
	spaceId?: string | null
}
