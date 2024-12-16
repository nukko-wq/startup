'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import { Diamond, GripVertical } from 'lucide-react'
import { Button } from 'react-aria-components'
import { fetchTabs } from '@/app/lib/redux/features/tabs/tabsSlice'
import type { RootState } from '@/app/lib/redux/store'
import type { Tab } from '@/app/lib/redux/features/tabs/types/tabs'
const TabList = () => {
	const dispatch = useAppDispatch()
	const { tabs, status, error } = useAppSelector(
		(state: RootState) => state.tabs,
	)

	useEffect(() => {
		dispatch(fetchTabs())
	}, [dispatch])

	const handleTabAction = (tab: Tab) => {
		// タブをクリックした時の処理を実装
	}

	if (status === 'loading') {
		return <div>読み込み中...</div>
	}

	if (status === 'failed') {
		return <div>エラー: {error}</div>
	}

	return (
		<div className="flex-grow py-5 pr-[16px] pl-[32px] max-w-[920px]">
			<div className="flex items-center justify-between gap-2 ml-4 mb-2">
				<div className="flex items-center gap-2">
					<Diamond className="w-6 h-6" />
					<div className="text-[17px] text-zinc-700">Tabs</div>
				</div>
				TabsMenu
			</div>
			{tabs.length > 0 && (
				<div className="border-slate-400 rounded-md flex flex-col bg-white shadow-sm">
					{tabs.map((tab) => (
						<div
							key={tab.id}
							className="block items-center gap-2 pr-2 py-1 truncate hover:bg-zinc-100 rounded cursor-grab group outline-none"
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
										TabSaveButton
									</div>
									<div className="opacity-0 group-hover:opacity-100">
										TabDeleteButton
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
			{tabs.length === 0 && (
				<div className="border-slate-400 rounded-md flex flex-col bg-white shadow-sm h-[56px] justify-center items-center">
					<p className="text-zinc-400 text-sm">Start browsing</p>
				</div>
			)}
		</div>
	)
}

export default TabList
