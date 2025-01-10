'use client'

import TabCloseButton from '@/app/features/tabs/components/main/TabCloseButton'
import TabSaveButton from '@/app/features/tabs/components/main/TabSaveButton'
import TabsMenu from '@/app/features/tabs/components/main/TabsMenu'
import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'
import { fetchTabs, updateTabs } from '@/app/lib/redux/features/tabs/tabsSlice'
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import type { RootState } from '@/app/lib/redux/store'
import { Diamond, GripVertical } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from 'react-aria-components'

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
		<div className="flex w-1/2 justify-center">
			<div className="max-w-[920px] flex-grow overflow-y-auto py-5 pr-[16px] pl-[32px]">
				<div className="mb-2 ml-4 flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Diamond className="h-6 w-6" />
						<div className="text-[17px] text-slate-700">Tabs</div>
					</div>
					<TabsMenu />
				</div>
				{tabs.length > 0 && (
					<div className="flex flex-col rounded-md border-slate-400 bg-white shadow-sm">
						{tabs.map((tab) => (
							<div
								key={tab.id}
								className="group block cursor-grab items-center gap-2 truncate rounded py-1 pr-2 outline-none hover:bg-gray-100"
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
											className="flex cursor-grab items-center pl-3 opacity-0 group-hover:opacity-100"
											aria-label="Drag Wrapper"
										>
											<Button
												className="cursor-grab"
												aria-label="ドラッグハンドル"
											>
												<GripVertical className="h-4 w-4 text-slate-500" />
											</Button>
										</div>
										<div className="flex items-center gap-2 truncate">
											{tab.faviconUrl ? (
												<img
													src={tab.faviconUrl}
													alt=""
													className="h-4 w-4 flex-grow"
												/>
											) : (
												<div className="h-4 w-4 rounded-full bg-gray-200" />
											)}
											<span className="truncate text-sm">{tab.title}</span>
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
					<div className="flex h-[56px] flex-col items-center justify-center rounded-md border-slate-400 bg-white shadow-sm">
						<p className="text-slate-400 text-sm">Start browsing</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default TabList
