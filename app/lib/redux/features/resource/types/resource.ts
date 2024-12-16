// Resourceの型定義

export interface Resource {
	id: string
	title: string
	url: string
	faviconUrl: string | null
	description: string | null
	sectionId: string
	userId: string
	order: number
	createdAt: string
	updatedAt: string
}
