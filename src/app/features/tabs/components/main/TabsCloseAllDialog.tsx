import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'

interface TabsCloseAllDialogProps {
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
}

const TabsCloseAllDialog = ({
	isOpen,
	onOpenChange,
}: TabsCloseAllDialogProps) => {
	const [isClosing, setIsClosing] = useState(false)

	const handleCloseAllTabs = async (close: () => void) => {
		try {
			setIsClosing(true)

			const extensionId = await tabsAPI.getExtensionId()

			if (!chrome?.runtime) {
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

			close()
		} catch (error) {
			console.error('タブの一括クローズエラー:', error)
		} finally {
			setIsClosing(false)
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className="hidden">Open Dialog</Button>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur-sm">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog role="alertdialog" className="outline-hidden relative">
						{({ close }) => (
							<>
								<Heading
									slot="title"
									className="text-xl font-semibold leading-6 my-0 text-slate-700"
								>
									すべてのタブを閉じる
								</Heading>
								<div className="w-6 h-6 text-red-500 absolute right-0 top-0">
									<AlertTriangle className="w-6 h-6" />
								</div>
								<p className="mt-3 text-slate-500">
									すべてのタブを閉じてもよろしいですか？この操作は取り消せません。
								</p>
								<div className="mt-6 flex justify-end gap-2">
									<Button
										onPress={close}
										className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 outline-hidden cursor-pointer"
										isDisabled={isClosing}
									>
										キャンセル
									</Button>
									<Button
										onPress={() => handleCloseAllTabs(close)}
										className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 outline-hidden disabled:opacity-50 cursor-pointer"
										isDisabled={isClosing}
									>
										{isClosing ? '実行中...' : 'すべて閉じる'}
									</Button>
								</div>
							</>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default TabsCloseAllDialog
