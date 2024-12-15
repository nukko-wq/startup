// Resourceの型定義

export interface Resource {
	id: string
	title: string
	url: string
	faviconUrl: string | null
	mimeType: string | null
	description: string | null
	isGoogleDrive: boolean
	sectionId: string
	userId: string
	order: number
	createdAt: string
	updatedAt: string
}
