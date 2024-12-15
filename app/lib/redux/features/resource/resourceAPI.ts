// resourceAPI.ts

import type { Resource } from '@/app/lib/redux/features/resource/types/resource'

interface CreateResourceData {
	title: string
	url: string
	sectionId: string
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
