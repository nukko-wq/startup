'use client'

import { useEffect, useState } from 'react'
import { useResourceStore } from '@/app/store/resourceStore'
import { Diamond, GripVertical } from 'lucide-react'
import TabSaveButton from '@/app/features/tabs/components/TabSaveButton'
import TabDeleteButton from '@/app/features/tabs/components/TabDeleteButton'
import { useTabStore } from '@/app/store/tabStore'
import {
	useDragAndDrop,
	GridList,
	GridListItem,
	Button,
} from 'react-aria-components'

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
	const tabs = useTabStore((state) => state.tabs)
	const setTabs = useTabStore((state) => state.setTabs)
	const switchToTab = useTabStore((state) => state.switchToTab)
	const [isLoading, setIsLoading] = useState(true)
	const [extensionId, setExtensionId] = useState<string>('')
	const addResource = useResourceStore((state) => state.addResource)

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
		const handleTabsUpdate = (event: MessageEvent) => {
			if (
				event.data &&
				event.data.source === 'startup-extension' &&
				event.data.type === 'TABS_UPDATED' &&
				Array.isArray(event.data.tabs)
			) {
				console.log('Received tabs update:', event.data.tabs)
				setTabs(event.data.tabs)
			}
		}

		const initialize = async () => {
			try {
				await fetchExtensionId()
				if (extensionId) {
					const tabs = await chrome.runtime.sendMessage(extensionId, {
						type: 'GET_CURRENT_TABS',
					})
					setTabs(tabs)
					setIsLoading(false)
				}
			} catch (error) {
				console.error('Failed to initialize tabs:', error)
				setIsLoading(false)
			}
		}

		initialize()

		// windowのメッセージイベントリスナーのみを使用
		window.addEventListener('message', handleTabsUpdate)

		return () => {
			window.removeEventListener('message', handleTabsUpdate)
		}
	}, [extensionId])

	// タブアイテムをドラッグ可能にする
	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const tab = tabs.find((t) => t.id === Array.from(keys)[0])
			return [
				{
					'tab-item': JSON.stringify({
						title: tab?.title,
						url: tab?.url,
						faviconUrl: tab?.faviconUrl,
					}),
					'text/plain': tab?.title || '',
				},
			]
		},
	})

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
			<GridList
				aria-label="Tabs"
				items={tabs}
				dragAndDropHooks={dragAndDropHooks}
				className="border-slate-400 rounded-md flex flex-col bg-white shadow-sm"
			>
				{(tab) => (
					<GridListItem
						textValue={tab.title}
						className="flex flex-grow items-center gap-2 pr-2 py-1 hover:bg-zinc-100 rounded cursor-grab group outline-none"
						onAction={() => handleTabClick(tab)}
					>
						<div className="flex flex-1 items-center gap-2 justify-between truncate">
							<div className="flex items-center gap-2">
								<div
									className="cursor-grab flex items-center opacity-0 group-hover:opacity-100 pl-4"
									aria-label="Drag Wrapper"
								>
									<Button
										className="cursor-grab"
										slot="drag"
										aria-label="ドラッグハンドル"
									>
										<GripVertical className="w-4 h-4 text-zinc-500" />
									</Button>
								</div>
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
					</GridListItem>
				)}
			</GridList>
		</div>
	)
}
