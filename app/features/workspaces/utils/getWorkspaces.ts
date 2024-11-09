import { db } from '@/lib/db'
import { cache } from 'react'
import type { Workspace } from '@/app/types/workspace'

export const getWorkspaces = cache(async (userId: string) => {
	if (!userId) {
		throw new Error('ユーザーIDが必要です')
	}

	try {
		// デフォルトワークスペースと通常のワークスペースを一度に取得
		const allWorkspaces = await db.workspace.findMany({
			where: {
				userId,
			},
			orderBy: [
				{ isDefault: 'desc' }, // デフォルトワークスペースを先頭に
				{ order: 'asc' }, // 次に順序で並べ替え
			],
			select: {
				id: true,
				name: true,
				order: true,
				userId: true,
				isDefault: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		if (!allWorkspaces.length) {
			// ワークスペースが存在しない場合、デフォルトワークスペースを作成
			const defaultWorkspace = await db.workspace.create({
				data: {
					name: 'Default',
					userId,
					isDefault: true,
					order: 0,
				},
				select: {
					id: true,
					name: true,
					order: true,
					userId: true,
					isDefault: true,
					createdAt: true,
					updatedAt: true,
				},
			})

			return [defaultWorkspace]
		}

		// デフォルトワークスペースが存在することを確認
		const hasDefault = allWorkspaces.some((workspace) => workspace.isDefault)
		if (!hasDefault) {
			// デフォルトワークスペースが存在しない場合、作成
			const defaultWorkspace = await db.workspace.create({
				data: {
					name: 'Default',
					userId,
					isDefault: true,
					order: 0,
				},
				select: {
					id: true,
					name: true,
					order: true,
					userId: true,
					isDefault: true,
					createdAt: true,
					updatedAt: true,
				},
			})

			return [defaultWorkspace, ...allWorkspaces]
		}

		return allWorkspaces
	} catch (error) {
		console.error('Error in getWorkspaces:', error)
		throw new Error('ワークスペースの取得に失敗しました')
	}
})
