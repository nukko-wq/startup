import { db } from '@/lib/db'
import { cache } from 'react'
import type { Workspace } from '@/app/types/workspace'

export const getWorkspaces = cache(async (userId: string) => {
	if (!userId) {
		throw new Error('ユーザーIDが必要です')
	}

	try {
		let user = await db.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			console.log('ユーザーが見つかりません。新規作成を試みます:', userId)
			// セッションからユーザー情報を取得して新規作成
			user = await db.user.create({
				data: {
					id: userId,
					email: '', // セッションから取得できる場合は設定
					name: '', // セッションから取得できる場合は設定
				},
			})
		}

		// デフォルトワークスペースと通常のワークスペースを一度に取得
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
		if (error instanceof Error) {
			throw new Error(`ワークスペースの取得に失敗しました: ${error.message}`)
		}
		throw new Error('ワークスペースの取得に失敗しました')
	}
})
