'use client'

import { useEffect, useState } from 'react'
import { useResourceStore } from '@/app/store/resourceStore'
import { Diamond } from 'lucide-react'
import TabSaveButton from '@/app/features/tabs/components/TabSaveButton'
import TabDeleteButton from '@/app/features/tabs/components/TabDeleteButton'
interface Tab {
	id: number
	title: string
	url: string
	faviconUrl: string
}

export default function TabList() {
	const [tabs, setTabs] = useState<Tab[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [extensionId, setExtensionId] = useState<string>('')
	const { addResource } = useResourceStore()

	const handleTabClick = async (tab: Tab) => {
		try {
			const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
			if (!extensionId) {
				console.error('Extension ID not found')
				return
			}

			await chrome.runtime.sendMessage(extensionId, {
				type: 'ACTIVATE_TAB',
				tabId: tab.id,
			})
		} catch (error) {
			console.error('Failed to activate tab:', error)
			// フォールバック：新しいタブで開く
			window.open(tab.url, '_blank')
		}
	}

	const handleDeleteTab = async (tabId: number) => {
		try {
			const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
			if (!extensionId) {
				console.error('Extension ID not found')
				return
			}

			await chrome.runtime.sendMessage(extensionId, {
				type: 'CLOSE_TAB',
				tabId: tabId,
			})

			// ローカルのタブリストを更新
			setTabs(tabs.filter((tab) => tab.id !== tabId))
		} catch (error) {
			console.error('Failed to close tab:', error)
		}
	}

	const fetchExtensionId = async () => {
		try {
			// まず、ローカルストレージから拡張機能IDを取得
			const storedExtensionId = localStorage.getItem('extensionId')
			if (storedExtensionId) {
				setExtensionId(storedExtensionId)
				return
			}

			// 拡張機能に問い合わせてIDを取得
			const response = await fetch('http://localhost:3000/api/extension-id', {
				method: 'GET',
			})

			if (!response.ok) {
				throw new Error('拡張機能IDの取得に失敗しました')
			}

			const data = await response.json()
			if (data.extensionId) {
				setExtensionId(data.extensionId)
				localStorage.setItem('extensionId', data.extensionId)
			}
		} catch (error) {
			console.error('拡張機能IDの取得に失敗:', error)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchExtensionId()
	}, [])

	useEffect(() => {
		const fetchTabs = async () => {
			try {
				const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
				if (!extensionId) {
					throw new Error('Extension ID not found')
				}

				// chrome.runtimeの存在確認を修正
				if (!window.chrome?.runtime?.sendMessage) {
					throw new Error('Chrome extension API not available')
				}

				const response = await chrome.runtime.sendMessage(extensionId, {
					type: 'GET_CURRENT_TABS',
				})

				if (response) {
					setTabs(response)
				}
			} catch (error) {
				console.error('Failed to fetch tabs:', error)
				// エラーの種類に応じて適切なメッセージを表示
				if (error instanceof Error) {
					if (error.message.includes('Extension ID not found')) {
						console.error('Extension ID is not configured')
					} else if (error.message.includes('Extension API not available')) {
						console.error('Chrome extension is not installed or not accessible')
					}
				}
			} finally {
				setIsLoading(false)
			}
		}

		fetchTabs()
	}, [])

	useEffect(() => {
		const checkExtension = async () => {
			const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
			if (!extensionId) {
				console.error('Extension ID not found')
				return false
			}

			try {
				// 拡張機能との通信テスト
				await chrome.runtime.sendMessage(extensionId, {
					type: 'GET_CURRENT_TABS',
				})
				return true
			} catch (error) {
				console.error('Extension communication failed:', error)
				return false
			}
		}

		checkExtension().then((isAvailable) => {
			if (!isAvailable) {
				setIsLoading(false)
			}
		})
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
		<div className="p-5 pr-[16px] pl-[32px] max-w-[920px]">
			<div className="flex items-center gap-2 py-2 ml-4 mb-2">
				<Diamond className="w-6 h-6" />
				<div className="text-[17px] text-zinc-700">Tabs</div>
			</div>
			<div className="border rounded-md flex flex-col">
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
