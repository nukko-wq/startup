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

	useEffect(() => {
		const fetchTabs = async () => {
			try {
				if (typeof window === 'undefined') {
					setIsLoading(false)
					return
				}

				const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
				if (!extensionId) {
					console.error('Extension ID not found')
					setIsLoading(false)
					return
				}

				if (!window.chrome?.runtime?.sendMessage) {
					console.error('Chrome runtime not available')
					setIsLoading(false)
					return
				}

				const response = await new Promise((resolve, reject) => {
					chrome.runtime.sendMessage(
						extensionId,
						{ type: 'GET_CURRENT_TABS' },
						(response) => {
							if (chrome.runtime.lastError) {
								reject(chrome.runtime.lastError)
							} else {
								resolve(response)
							}
						},
					)
				})

				if (response) {
					setTabs(response as Tab[])
				}
			} catch (error) {
				console.error('Failed to fetch tabs:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchTabs()
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
