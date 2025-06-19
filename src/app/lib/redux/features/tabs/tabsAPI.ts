// /app/lib/redux/features/tabs/tabsAPI.ts
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'

// キャッシュ用の変数
let cachedExtensionId: string | null = null

// メッセージ送信のタイムアウト時間（ミリ秒）
const MESSAGE_TIMEOUT = 5000

// Promise with timeout utility
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error('Operation timed out')), timeoutMs),
		),
	])
}

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
					await withTimeout(
						new Promise((resolve, reject) => {
							if (!chrome?.runtime) {
								reject(new Error('Chrome runtime not available'))
								return
							}

							chrome.runtime.sendMessage(id, { type: 'PING' }, (response) => {
								if (chrome.runtime.lastError) {
									reject(new Error(chrome.runtime.lastError.message))
								} else if (response?.success) {
									resolve(response)
								} else {
									reject(new Error('Invalid response from extension'))
								}
							})
						}),
						MESSAGE_TIMEOUT,
					)
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

		return withTimeout(
			new Promise((resolve, reject) => {
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
			}),
			MESSAGE_TIMEOUT,
		)
	},

	async openTabAtEnd(url: string): Promise<void> {
		const extensionId = await this.getExtensionId()

		if (!chrome?.runtime) {
			throw new Error('拡張機能が見つかりません')
		}

		return withTimeout(
			new Promise((resolve, reject) => {
				chrome.runtime.sendMessage(
					extensionId,
					{ type: 'OPEN_TAB_AT_END', url },
					(response) => {
						if (chrome.runtime.lastError) {
							reject(new Error(chrome.runtime.lastError.message))
							return
						}
						if (response?.success) {
							resolve()
						} else {
							reject(new Error(response?.error || 'タブの作成に失敗しました'))
						}
					},
				)
			}),
			MESSAGE_TIMEOUT,
		)
	},

	async switchToTab(tabId: number): Promise<void> {
		const extensionId = await this.getExtensionId()

		if (!chrome?.runtime) {
			throw new Error('拡張機能が見つかりません')
		}

		return withTimeout(
			new Promise((resolve, reject) => {
				chrome.runtime.sendMessage(
					extensionId,
					{ type: 'SWITCH_TO_TAB', tabId },
					(response) => {
						if (chrome.runtime.lastError) {
							reject(new Error(chrome.runtime.lastError.message))
							return
						}
						if (response?.success) {
							resolve()
						} else {
							reject(
								new Error(response?.error || 'タブの切り替えに失敗しました'),
							)
						}
					},
				)
			}),
			MESSAGE_TIMEOUT,
		)
	},

	async moveTab(tabId: number, newIndex: number): Promise<void> {
		const extensionId = await this.getExtensionId()

		if (!chrome?.runtime) {
			throw new Error('拡張機能が見つかりません')
		}

		return withTimeout(
			new Promise((resolve, reject) => {
				chrome.runtime.sendMessage(
					extensionId,
					{ type: 'MOVE_TAB', tabId, newIndex },
					(response) => {
						if (chrome.runtime.lastError) {
							reject(new Error(chrome.runtime.lastError.message))
							return
						}
						if (response?.success) {
							resolve()
						} else {
							reject(new Error(response?.error || 'タブの移動に失敗しました'))
						}
					},
				)
			}),
			MESSAGE_TIMEOUT,
		)
	},
}
