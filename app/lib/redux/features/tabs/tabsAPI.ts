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

			// 利用可能な拡張機能IDを検証
			for (const id of extensionIds) {
				try {
					// 拡張機能が実際に利用可能かテスト
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
					cachedExtensionId = id
					return id
				} catch (e) {
					console.warn(`Extension ID ${id} is not available:`, e)
				}
			}
			throw new Error('No valid extension ID found')
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
