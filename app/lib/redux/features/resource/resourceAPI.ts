// resourceAPI.ts

import type { Resource } from '@/app/lib/redux/features/resource/types/resource'

interface CreateResourceData {
	title: string
	url: string
	sectionId: string
	faviconUrl?: string | null
}

export const createResource = async (
	data: CreateResourceData,
): Promise<Resource> => {
	const response = await fetch('/api/resources', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		throw new Error('Failed to create resource')
	}

	return response.json()
}

export const deleteResource = async (resourceId: string): Promise<void> => {
	const response = await fetch(`/api/resources/${resourceId}`, {
		method: 'DELETE',
	})

	if (!response.ok) {
		throw new Error('リソースの削除に失敗しました')
	}
}

export const updateResource = async (data: {
	id: string
	url: string
	title?: string
	description?: string
}): Promise<Resource> => {
	const response = await fetch(`/api/resources/${data.id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		throw new Error('Failed to update resource')
	}

	return response.json()
}
