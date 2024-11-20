export interface Resource {
	id: string
	title: string
	url: string
	faviconUrl: string | null
	mimeType: string | null
	isGoogleDrive: boolean
	position: number
	description: string | null
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
	spaceId?: string | null | undefined
}
