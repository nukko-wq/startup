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

interface PingResponse {
	success: boolean
}

export default function TabList() {
	const [tabs, setTabs] = useState<Tab[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [extensionId, setExtensionId] = useState<string>('')
	const { addResource } = useResourceStore()

	const handleTabClick = async (tab: Tab) => {
		try {
			const storedExtensionId = localStorage.getItem('extensionId')
			if (!storedExtensionId) {
				throw new Error('Extension ID not found')
			}

			await chrome.runtime.sendMessage(storedExtensionId, {
				type: 'ACTIVATE_TAB',
				tabId: tab.id,
			})
		} catch (error) {
			console.error('Failed to activate tab:', error)
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
		try {
			const storedExtensionId = localStorage.getItem('extensionId')
			if (storedExtensionId) {
				try {
					const pingResponse = await chrome.runtime.sendMessage(
						storedExtensionId,
						{
							type: 'PING',
						},
					)
					if (pingResponse?.success) {
						setExtensionId(storedExtensionId)
						return storedExtensionId
					}
				} catch (error) {
					console.log('Stored extension ID is invalid, fetching new one')
					localStorage.removeItem('extensionId')
				}
			}

			if (!window.chrome?.runtime) {
				throw new Error('Chrome extension API not available')
			}

			try {
				const message = { type: 'PING' }
				const response = await new Promise<PingResponse>((resolve) => {
					chrome.runtime.sendMessage(message, (response) => {
						resolve(response)
					})
				})

				if (response?.success && chrome.runtime.id) {
					const newExtensionId = chrome.runtime.id
					setExtensionId(newExtensionId)
					localStorage.setItem('extensionId', newExtensionId)
					return newExtensionId
				}
			} catch (error) {
				console.log('Failed to get extension ID:', error)
			}

			console.error('No valid extension found')
			return null
		} catch (error) {
			console.error('拡張機能IDの取得に失敗:', error)
			return null
		}
	}

	const fetchTabs = async (extensionId: string) => {
		try {
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
		} finally {
			setIsLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const initializeTabs = async () => {
			try {
				const extensionId = await fetchExtensionId()
				if (extensionId) {
					await fetchTabs(extensionId)
				}
			} catch (error) {
				console.error('Failed to initialize tabs:', error)
			} finally {
				setIsLoading(false)
			}
		}

		if (typeof window !== 'undefined') {
			initializeTabs()
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
