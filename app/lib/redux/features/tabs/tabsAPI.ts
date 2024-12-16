// /app/lib/redux/features/tabs/tabsAPI.ts
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'

export const tabsAPI = {
	async getTabs(): Promise<Tab[]> {
		// 拡張機能IDを取得
		const response = await fetch('/api/extension/id')
		const { extensionIds } = await response.json()
		const extensionId = extensionIds[0]

		if (!extensionId) {
			throw new Error('拡張機能IDが設定されていません')
		}

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
