import { EllipsisVertical, Trash2, AlertTriangle, FilePlus } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'

interface SectionMenuButtonProps {
	sectionId: string
	onDelete: (sectionId: string) => void
	onResourceCreate: () => void
}

const SectionMenuButton = ({
	sectionId,
	onDelete,
	onResourceCreate,
}: SectionMenuButtonProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	const handleDelete = async (close: () => void) => {
		try {
			const response = await fetch(`/api/sections/${sectionId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to delete section')
			}

			onDelete(sectionId)
			close()
		} catch (error) {
			console.error('Section delete error:', error)
			alert('セクションの削除に失敗しました。')
		}
	}

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-2 hover:bg-zinc-200 rounded-full"
				>
					<EllipsisVertical className="w-6 h-6 text-zinc-700" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md min-w-[200px]">
						<MenuItem
							onAction={onResourceCreate}
							className="p-2 outline-none hover:bg-zinc-200 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<FilePlus className="w-4 h-4" />
								Add a resource
							</div>
						</MenuItem>
						<MenuItem
							onAction={() => setIsDeleteDialogOpen(true)}
							className="p-2 outline-none hover:bg-zinc-200 text-red-600 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								Delete section
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<DialogTrigger
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
					<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
						<Dialog role="alertdialog" className="outline-none relative">
							{({ close }) => (
								<>
									<Heading
										slot="title"
										className="text-xl font-semibold leading-6 my-0 text-slate-700"
									>
										セクションの削除
									</Heading>
									<div className="w-6 h-6 text-red-500 absolute right-0 top-0">
										<AlertTriangle className="w-6 h-6" />
									</div>
									<p className="mt-3 text-slate-500">
										このセクションを削除してもよろしいですか？この操作は取り消せません。
									</p>
									<div className="mt-6 flex justify-end gap-2">
										<Button
											onPress={close}
											className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 outline-none"
										>
											キャンセル
										</Button>
										<Button
											onPress={() => handleDelete(close)}
											className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 outline-none"
										>
											削除
										</Button>
									</div>
								</>
							)}
						</Dialog>
					</Modal>
				</ModalOverlay>
			</DialogTrigger>
		</>
	)
}

export default SectionMenuButton
