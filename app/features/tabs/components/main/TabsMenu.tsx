import { EllipsisVertical, FilePlus, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'

const TabsMenu = () => {
	const handleSortByDomain = async () => {
		try {
			const response = await fetch('/api/extension/id')
			const { extensionIds } = await response.json()
			const extensionId = extensionIds[0]

			if (!extensionId || !chrome?.runtime) {
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

	const handleCloseAllTabs = async () => {
		try {
			const response = await fetch('/api/extension/id')
			const { extensionIds } = await response.json()
			const extensionId = extensionIds[0]

			if (!extensionId || !chrome?.runtime) {
				throw new Error('拡張機能が見つかりません')
			}

			chrome.runtime.sendMessage(
				extensionId,
				{ type: 'CLOSE_ALL_TABS' },
				(response) => {
					if (!response?.success) {
						console.error('タブの一括クローズに失敗しました')
					}
				},
			)
		} catch (error) {
			console.error('タブの一括クローズエラー:', error)
		}
	}

	return (
		<MenuTrigger>
			<Button
				aria-label="Menu"
				className="outline-none p-2 hover:bg-zinc-200 transition-colors duration-200 rounded-full"
			>
				<EllipsisVertical className="w-6 h-6 text-zinc-700" />
			</Button>
			<Popover>
				<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md min-w-[200px]">
					<MenuItem
						onAction={handleSortByDomain}
						className="p-2 outline-none cursor-pointer"
					>
						<div className="flex items-center gap-2">
							<FilePlus className="w-4 h-4" />
							Sort by domain
						</div>
					</MenuItem>
					<MenuItem
						className="p-2 outline-none text-red-600 cursor-pointer"
						onAction={handleCloseAllTabs}
					>
						<div className="flex items-center gap-2">
							<Trash2 className="w-4 h-4" />
							Close all tabs
						</div>
					</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	)
}

export default TabsMenu
