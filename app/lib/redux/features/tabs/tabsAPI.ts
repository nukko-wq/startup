// /app/lib/redux/features/tabs/tabsAPI.ts
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'

// キャッシュ用の変数
let cachedExtensionId: string | null = null

export const tabsAPI = {
	async getExtensionId(): Promise<string> {
		if (cachedExtensionId) {
			return cachedExtensionId
		}

		const response = await fetch('/api/extension/id')
		const { extensionIds } = await response.json()
		cachedExtensionId = extensionIds[0]

		if (!cachedExtensionId) {
			throw new Error('拡張機能IDが設定されていません')
		}

		return cachedExtensionId
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
