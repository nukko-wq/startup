'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import { Diamond, GripVertical } from 'lucide-react'
import { Button } from 'react-aria-components'
import { fetchTabs, updateTabs } from '@/app/lib/redux/features/tabs/tabsSlice'
import TabSaveButton from '@/app/features/tabs/components/main/TabSaveButton'
import type { RootState } from '@/app/lib/redux/store'
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'
import TabCloseButton from '@/app/features/tabs/components/main/TabCloseButton'
import TabsMenu from '@/app/features/tabs/components/main/TabsMenu'
import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'

const TabList = () => {
	const dispatch = useAppDispatch()
	const { tabs, status, error } = useAppSelector(
		(state: RootState) => state.tabs,
	)
	const sections = useAppSelector((state: RootState) => state.section.sections)

	// 最初のセクションのIDを取得
	const defaultSectionId = sections[0]?.id

	useEffect(() => {
		// 初期タブ情報の取得
		dispatch(fetchTabs())

		// 拡張機能からのメッセージを受け取るリスナーを設定
		const handleMessage = (event: MessageEvent) => {
			if (
				event.data.source === 'startup-extension' &&
				event.data.type === 'TABS_UPDATED'
			) {
				dispatch(updateTabs(event.data.tabs))
			}
		}

		window.addEventListener('message', handleMessage)

		// クリーンアップ
		return () => {
			window.removeEventListener('message', handleMessage)
		}
	}, [dispatch])

	// タブをクリックしたときの処理
	const handleTabAction = async (tab: Tab) => {
		try {
			const extensionId = await tabsAPI.getExtensionId()

			if (!chrome?.runtime) {
				throw new Error('拡張機能が見つかりません')
			}

			chrome.runtime.sendMessage(
				extensionId,
				{ type: 'SWITCH_TO_TAB', tabId: tab.id },
				(response) => {
					if (!response?.success) {
						console.error('タブの切り替えに失敗しました')
					}
				},
			)
		} catch (error) {
			console.error('タブの切り替えエラー:', error)
		}
	}

	if (status === 'failed') {
		return <div>エラー: {error}</div>
	}

	return (
		<div className="flex justify-center w-1/2">
			<div className="flex-grow py-5 pr-[16px] pl-[32px] max-w-[920px]">
				<div className="flex items-center justify-between gap-2 ml-4 mb-2">
					<div className="flex items-center gap-2">
						<Diamond className="w-6 h-6" />
						<div className="text-[17px] text-slate-700">Tabs</div>
					</div>
					<TabsMenu />
				</div>
				{tabs.length > 0 && (
					<div className="border-slate-400 rounded-md flex flex-col bg-white shadow-sm">
						{tabs.map((tab) => (
							<div
								key={tab.id}
								className="block items-center gap-2 pr-2 py-1 truncate hover:bg-gray-100 rounded cursor-grab group outline-none"
								onClick={() => handleTabAction(tab)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleTabAction(tab)
									}
								}}
							>
								<div className="grid grid-cols-[1fr_72px] items-center gap-2">
									<div className="flex items-center gap-2 truncate">
										<div
											className="cursor-grab flex items-center opacity-0 group-hover:opacity-100 pl-3"
											aria-label="Drag Wrapper"
										>
											<Button
												className="cursor-grab"
												aria-label="ドラッグハンドル"
											>
												<GripVertical className="w-4 h-4 text-slate-500" />
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
											<TabSaveButton tab={tab} sectionId={defaultSectionId} />
										</div>
										<div className="opacity-0 group-hover:opacity-100">
											<TabCloseButton tabId={tab.id} />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
				{tabs.length === 0 && (
					<div className="border-slate-400 rounded-md flex flex-col bg-white shadow-sm h-[56px] justify-center items-center">
						<p className="text-slate-400 text-sm">Start browsing</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default TabList
