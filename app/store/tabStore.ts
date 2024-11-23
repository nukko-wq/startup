import { create } from 'zustand'

interface Tab {
	id: number
	url: string
	title: string
	faviconUrl: string
}

interface TabStore {
	tabs: Tab[]
	setTabs: (tabs: Tab[] | ((prev: Tab[]) => Tab[])) => void
	findTabByUrl: (url: string) => Tab | undefined
	switchToTab: (tabId: number) => Promise<boolean>
	closeAllTabs: () => Promise<boolean>
}

export const useTabStore = create<TabStore>((set, get) => ({
	tabs: [],
	setTabs: (tabs) =>
		set((state) => ({
			tabs: typeof tabs === 'function' ? tabs(state.tabs) : tabs,
		})),
	findTabByUrl: (url) => {
		const { tabs } = get()
		return tabs.find((tab) => {
			// URLの正規化を改善
			const normalizeUrl = (u: string) => {
				try {
					const urlObj = new URL(u)
					// ドメイン名の正規化（www.を除去）
					let hostname = urlObj.hostname.replace(/^www\./, '')

					// 一般的なリダイレクト先のマッピング
					const redirectMap: { [key: string]: string } = {
						'google.com': 'www.google.com',
						'apple.com': 'www.apple.com',
						// 必要に応じて他のドメインも追加
					}

					if (redirectMap[hostname]) {
						hostname = redirectMap[hostname]
					}

					// プロトコルを含まないベースURLを構築
					let normalizedUrl = hostname + urlObj.pathname

					// 末尾のスラッシュを統一
					normalizedUrl = normalizedUrl.replace(/\/$/, '')

					// クエリパラメータを正規化（必要な場合）
					const searchParams = new URLSearchParams(urlObj.search)
					const sortedParams = Array.from(searchParams.entries())
						.sort(([a], [b]) => a.localeCompare(b))
						.filter(([key]) => {
							// 無視するクエリパラメータを指定
							const ignoreParams = ['utm_source', 'utm_medium', 'utm_campaign']
							return !ignoreParams.includes(key)
						})

					if (sortedParams.length > 0) {
						normalizedUrl += `?${sortedParams.map(([key, value]) => `${key}=${value}`).join('&')}`
					}

					console.log('Normalized URL:', {
						original: u,
						normalized: normalizedUrl,
						hostname: hostname,
					})

					return normalizedUrl
				} catch (error) {
					console.error('URL normalization error:', error)
					return u
				}
			}

			const normalizedTabUrl = normalizeUrl(tab.url)
			const normalizedTargetUrl = normalizeUrl(url)

			const isMatch = normalizedTabUrl === normalizedTargetUrl
			console.log('URL Comparison:', {
				tab: normalizedTabUrl,
				target: normalizedTargetUrl,
				match: isMatch,
			})

			return isMatch
		})
	},
	switchToTab: async (tabId) => {
		try {
			const extensionId = localStorage.getItem('extensionId')
			if (!extensionId) return false

			const response = await chrome.runtime.sendMessage(extensionId, {
				type: 'SWITCH_TO_TAB',
				tabId,
			})
			return response?.success ?? false
		} catch (error) {
			console.error('Failed to switch tab:', error)
			return false
		}
	},
	closeAllTabs: async () => {
		try {
			const extensionId = localStorage.getItem('extensionId')
			if (!extensionId) return false

			const response = await chrome.runtime.sendMessage(extensionId, {
				type: 'CLOSE_ALL_TABS',
			})
			return response?.success ?? false
		} catch (error) {
			console.error('Failed to close all tabs:', error)
			return false
		}
	},
}))
