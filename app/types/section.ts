export interface Resource {
	id: string
	title: string
	description: string
	url: string
	faviconUrl: string
	position: number
	mimeType: string
	isGoogleDrive: boolean
	sectionId: string
}

export interface Section {
	id: string
	name: string
	order: number
	userId: string
	spaceId: string | null
	resources: Resource[]
}
