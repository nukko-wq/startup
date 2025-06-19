import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/lib/redux/store'

// 基本的なセレクター
export const selectResources = (state: RootState) => state.resource.resources

// セクションIDに基づいてリソースをフィルタリングするセレクター
export const selectResourcesBySectionId = createSelector(
	[selectResources, (state: RootState, sectionId: string) => sectionId],
	(resources, sectionId) => {
		return resources.filter((resource) => resource.sectionId === sectionId)
	},
)

// アクティブなスペースのセクションに属するリソースを取得するセレクター
export const selectResourcesByActiveSpace = createSelector(
	[
		selectResources,
		(state: RootState) => state.section.sections,
		(state: RootState) => state.space.activeSpaceId,
	],
	(resources, sections, activeSpaceId) => {
		if (!activeSpaceId) return []

		// アクティブなスペースに属するセクションのIDを取得
		const sectionIds = sections
			.filter((section) => section.spaceId === activeSpaceId)
			.map((section) => section.id)

		// それらのセクションに属するリソースをフィルタリング
		return resources.filter((resource) =>
			sectionIds.includes(resource.sectionId),
		)
	},
)

// リソースを順序で並び替えるセレクター
export const selectSortedResources = createSelector(
	[selectResources],
	(resources) => {
		return [...resources].sort((a, b) => a.order - b.order)
	},
)

// セクションごとのソート済みリソースを取得するセレクター
export const selectSortedResourcesBySectionId = createSelector(
	[selectResourcesBySectionId],
	(resources) => {
		return [...resources].sort((a, b) => a.order - b.order)
	},
)
