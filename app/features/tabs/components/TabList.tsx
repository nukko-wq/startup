'use client'

import { useEffect, useState } from 'react'
import { useResourceStore } from '@/app/store/resourceStore'
import { Diamond } from 'lucide-react'
import TabSaveButton from '@/app/features/tabs/components/TabSaveButton'
import TabDeleteButton from '@/app/features/tabs/components/TabDeleteButton'
import { useTabStore } from '@/app/store/tabStore'

interface Tab {
	id: number
	title: string
	url: string
	faviconUrl: string
}

interface PingResponse {
	success: boolean
}

// メッセージの型定義を追加
interface TabsUpdateMessage {
	type: string
	tabs: Tab[]
}

export default function TabList() {
	const { tabs, setTabs, switchToTab } = useTabStore()
	const [isLoading, setIsLoading] = useState(true)
	const [extensionId, setExtensionId] = useState<string>('')
	const { addResource } = useResourceStore()

	const handleTabClick = async (tab: Tab) => {
		try {
			console.log('Attempting to switch to tab:', tab)
			const success = await switchToTab(tab.id)

			if (!success) {
				console.log('Failed to switch tab, falling back to window.open')
				window.open(tab.url, '_blank')
			}
		} catch (error) {
			console.error('Error switching tab:', error)
			window.open(tab.url, '_blank')
		}
	}

	const handleDeleteTab = async (tabId: number) => {
		try {
			const storedExtensionId = localStorage.getItem('extensionId')
			if (!storedExtensionId) {
				throw new Error('Extension ID not found')
			}

			await chrome.runtime.sendMessage(storedExtensionId, {
				type: 'CLOSE_TAB',
				tabId: tabId,
			})

			setTabs(tabs.filter((tab) => tab.id !== tabId))
		} catch (error) {
			console.error('Failed to close tab:', error)
		}
	}

	const fetchExtensionId = async () => {
		if (typeof window === 'undefined' || !window.chrome?.runtime) {
			console.log('Chrome extension API not available')
			setIsLoading(false)
			return null
		}

		try {
			const storedExtensionId = localStorage.getItem('extensionId')
			if (storedExtensionId) {
				try {
					const response = await chrome.runtime.sendMessage(storedExtensionId, {
						type: 'PING',
					})
					if (response?.success) {
						setExtensionId(storedExtensionId)
						return storedExtensionId
					}
				} catch (error) {
					console.log('Stored extension ID is invalid')
					localStorage.removeItem('extensionId')
				}
			}

			// 拡張機能IDの取得を試みる
			const extensionIds = [
				...(process.env.NEXT_PUBLIC_EXTENSION_ID_PROD?.split(',') || []),
				process.env.NEXT_PUBLIC_EXTENSION_ID_DEV,
			].filter(Boolean)

			for (const id of extensionIds) {
				try {
					const response = await chrome.runtime.sendMessage(id, {
						type: 'PING',
					})
					if (response?.success && id) {
						setExtensionId(id)
						localStorage.setItem('extensionId', id)
						return id
					}
				} catch (error) {
					console.log(`Failed to connect to extension ${id}`)
				}
			}
			setIsLoading(false)
			return null
		} catch (error) {
			console.error('Failed to get extension ID:', error)
			setIsLoading(false)
			return null
		}
	}

	const fetchTabs = async (extensionId: string) => {
		try {
			const response = await chrome.runtime.sendMessage(extensionId, {
				type: 'GET_CURRENT_TABS',
			})
			if (response) {
				console.log('Received tabs:', response)
				setTabs(response)
			}
		} catch (error) {
			console.error('Failed to fetch tabs:', error)
		} finally {
			setIsLoading(false)
		}
	}

	// 初期化とメッセージリスナーのセットアップ
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const initialize = async () => {
			const id = await fetchExtensionId()
			if (id) {
				await fetchTabs(id)
			}
		}

		const handleTabsUpdate = (event: MessageEvent) => {
			if (event.data?.source !== 'startup-extension') return

			const message = event.data?.payload
			console.log('Processing extension message:', message)

			if (message?.type === 'TABS_UPDATED' && Array.isArray(message.tabs)) {
				console.log('Updating tabs with:', message.tabs)
				setTabs(message.tabs)
				setIsLoading(false)
			}
		}

		if (typeof window !== 'undefined') {
			initialize()
			window.addEventListener('message', handleTabsUpdate)
			console.log('Message listener set up')
		}

		return () => {
			window.removeEventListener('message', handleTabsUpdate)
		}
	}, [])

	if (isLoading) {
		return (
			<div className="flex items-center pl-10 pr-4 py-4">
				<div>タブを読み込み中...</div>
			</div>
		)
	}

	if (typeof window === 'undefined' || !window.chrome?.runtime) {
		return (
			<div className="flex items-center pl-10 pr-4 py-4">
				<p>Chrome拡張機能をインストールすると、開いているタブを表示できます</p>
			</div>
		)
	}

	return (
		<div className="flex-grow p-4 pr-[16px] pl-[32px] max-w-[920px]">
			<div className="flex items-center gap-2 py-2 ml-4 mb-2">
				<Diamond className="w-6 h-6" />
				<div className="text-[17px] text-zinc-700">Tabs</div>
			</div>
			<div className="border-slate-400 rounded-md flex flex-col bg-white shadow-sm">
				{tabs.map((tab) => (
					<div
						key={tab.id}
						className="flex flex-grow items-center gap-2 pl-8 pr-2 py-2 hover:bg-gray-100 rounded cursor-pointer group"
						onClick={() => handleTabClick(tab)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleTabClick(tab)
							}
						}}
					>
						<div className="flex flex-1 items-center gap-2 justify-between truncate">
							<div className="flex items-center gap-2 truncate">
								{tab.faviconUrl ? (
									<img
										src={tab.faviconUrl}
										alt=""
										className="w-4 h-4 flex-grow"
									/>
								) : (
									<div className="w-4 h-4 bg-gray-200 rounded-full" />
								)}
								<span className="truncate">{tab.title}</span>
							</div>
							<div className="flex items-center">
								<div className="opacity-0 group-hover:opacity-100">
									<TabSaveButton
										title={tab.title}
										url={tab.url}
										faviconUrl={tab.faviconUrl}
									/>
								</div>
								<div className="opacity-0 group-hover:opacity-100">
									<TabDeleteButton tabId={tab.id} onDelete={handleDeleteTab} />
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
