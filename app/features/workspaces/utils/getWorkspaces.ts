import { db } from '@/lib/db'
import { cache } from 'react'
import type { Workspace } from '@/app/types/workspace'

export const getWorkspaces = cache(async (userId: string) => {
	if (!userId) {
		throw new Error('ユーザーIDが必要です')
	}

	try {
		// ユーザーの存在確認を追加
		const user = await db.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			throw new Error('ユーザーが見つかりません')
		}

		const allWorkspaces = await db.workspace.findMany({
			where: {
				userId,
			},
			orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
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
			// トランザクションを使用してデフォルトワークスペースを作成
			const defaultWorkspace = await db.$transaction(async (tx) => {
				return tx.workspace.create({
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
			})

			return [defaultWorkspace]
		}

		return allWorkspaces
	} catch (error) {
		console.error('Error in getWorkspaces:', error)
		throw new Error('ワークスペースの取得に失敗しました')
	}
})
