// app/lib/redux/features/section/sectionAPI.ts
import type { Section } from '@/app/lib/redux/features/section/types/section'

export const createSection = async (name: string, spaceId: string) => {
	const response = await fetch('/api/sections', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ name, spaceId }),
	})

	if (!response.ok) {
		throw new Error('セクションの作成に失敗しました')
	}

	return response.json()
}

export const deleteSection = async (sectionId: string) => {
	const response = await fetch(`/api/sections/${sectionId}`, {
		method: 'DELETE',
	})

	if (!response.ok) {
		throw new Error('セクションの削除に失敗しました')
	}

	return response.json()
}

export const updateSectionName = async (sectionId: string, name: string) => {
	const response = await fetch(`/api/sections/${sectionId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ name }),
	})

	if (!response.ok) {
		throw new Error('セクション名の更新に失敗しました')
	}

	return response.json()
}

export const reorderSections = async (spaceId: string, sections: Section[]) => {
	const response = await fetch('/api/sections/reorder', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			spaceId,
			sections: sections.map((section, index) => ({
				id: section.id,
				order: index,
			})),
		}),
	})

	if (!response.ok) {
		throw new Error('セクションの順序更新に失敗しました')
	}

	return response.json()
}
