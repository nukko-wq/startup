import TabsCloseAllDialog from '@/app/features/tabs/components/main/TabsCloseAllDialog'
import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'
import { ArrowDownAZ, Earth, EllipsisVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'

const TabsMenu = () => {
	const [isCloseAllDialogOpen, setIsCloseAllDialogOpen] = useState(false)

	const handleSortByAlphabetical = async () => {
		try {
			const extensionId = await tabsAPI.getExtensionId()

			if (!chrome?.runtime) {
				throw new Error('拡張機能が見つかりません')
			}

			chrome.runtime.sendMessage(
				extensionId,
				{ type: 'SORT_TABS_BY_ALPHABETICAL' },
				(response) => {
					if (!response?.success) {
						console.error('タブのアルファベット順並び替えに失敗しました')
					}
				},
			)
		} catch (error) {
			console.error('タブのアルファベット順並び替えエラー:', error)
		}
	}

	const handleSortByDomain = async () => {
		try {
			const extensionId = await tabsAPI.getExtensionId()

			if (!chrome?.runtime) {
				throw new Error('拡張機能が見つかりません')
			}

			chrome.runtime.sendMessage(
				extensionId,
				{ type: 'SORT_TABS_BY_DOMAIN' },
				(response) => {
					if (!response?.success) {
						console.error('タブの並び替えに失敗しました')
					}
				},
			)
		} catch (error) {
			console.error('タブの並び替えエラー:', error)
		}
	}

	const handleCloseAllTabs = () => {
		setIsCloseAllDialogOpen(true)
	}

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-hidden p-2 hover:bg-zinc-200 transition-colors duration-200 rounded-full cursor-pointer"
				>
					<EllipsisVertical className="w-6 h-6 text-zinc-700" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-hidden border rounded-lg shadow-md min-w-[200px]">
						<MenuItem
							onAction={handleSortByAlphabetical}
							className="p-2 outline-hidden cursor-pointer hover:bg-slate-100"
						>
							<div className="flex items-center gap-2 text-sm">
								<ArrowDownAZ className="w-4 h-4" />
								Sort by Alphabetical
							</div>
						</MenuItem>
						<MenuItem
							onAction={handleSortByDomain}
							className="p-2 outline-hidden cursor-pointer hover:bg-slate-100"
						>
							<div className="flex items-center gap-2 text-sm">
								<Earth className="w-4 h-4" />
								Sort by domain
							</div>
						</MenuItem>
						<MenuItem
							className="p-2 outline-hidden text-red-600 cursor-pointer hover:bg-slate-100"
							onAction={handleCloseAllTabs}
						>
							<div className="flex items-center gap-2 text-sm">
								<Trash2 className="w-4 h-4" />
								Close all tabs
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<TabsCloseAllDialog
				isOpen={isCloseAllDialogOpen}
				onOpenChange={setIsCloseAllDialogOpen}
			/>
		</>
	)
}

export default TabsMenu
