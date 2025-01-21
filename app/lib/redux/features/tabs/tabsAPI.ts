// /app/lib/redux/features/tabs/tabsAPI.ts
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'

// キャッシュ用の変数
let cachedExtensionId: string | null = null

export const tabsAPI = {
	async getExtensionId(): Promise<string> {
		if (cachedExtensionId) {
			return cachedExtensionId
		}

		try {
			const response = await fetch('/api/extension/id')
			const { extensionIds } = await response.json()

			// すべての拡張機能IDを順番にチェック
			const errors: Error[] = []
			for (const id of extensionIds) {
				try {
					await new Promise((resolve, reject) => {
						chrome.runtime.sendMessage(id, { type: 'PING' }, (response) => {
							if (chrome.runtime.lastError) {
								reject(chrome.runtime.lastError)
							} else if (response?.success) {
								resolve(response)
							} else {
								reject(new Error('Invalid response'))
							}
						})
					})
					// 有効なIDが見つかった場合はキャッシュして返す
					cachedExtensionId = id
					return id
				} catch (e) {
					// エラーを収集して続行
					errors.push(e as Error)
					console.warn(`Extension ID ${id} is not available:`, e)
				}
			}
			// すべてのIDが失敗した場合のみエラーを投げる
			throw new Error(
				`No valid extension ID found. Errors: ${errors.map((e) => e.message).join(', ')}`,
			)
		} catch (error) {
			console.error('Failed to get extension ID:', error)
			throw error
		}
	},

	async getTabs(): Promise<Tab[]> {
		const extensionId = await this.getExtensionId()

		if (!chrome?.runtime) {
			throw new Error('拡張機能が見つかりません')
		}

		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(
				extensionId,
				{ type: 'REQUEST_TABS_UPDATE' },
				(response) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message))
						return
					}
					if (response?.success) {
						resolve(response.tabs)
					} else {
						reject(new Error(response?.error || 'タブの取得に失敗しました'))
					}
				},
			)
		})
	},
}
