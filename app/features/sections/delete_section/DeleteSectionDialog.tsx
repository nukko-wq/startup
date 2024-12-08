import { AlertTriangle } from 'lucide-react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import { useResourceStore } from '@/app/store/resourceStore'

interface DeleteSectionDialogProps {
	sectionId: string
	onDelete?: (sectionId: string) => void
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
}

const DeleteSectionDialog = ({
	sectionId,
	onDelete,
	isOpen,
	onOpenChange,
}: DeleteSectionDialogProps) => {
	const deleteSection = useResourceStore((state) => state.deleteSection)

	const handleDelete = async (close: () => void) => {
		const { sections, resources } = useResourceStore.getState()

		// 現在の状態をバックアップ
		const previousSections = [...sections]
		const previousResources = [...resources]

		try {
			// 楽観的に画面を更新
			useResourceStore.setState({
				sections: sections.filter((section) => section.id !== sectionId),
				resources: resources.filter(
					(resource) => resource.sectionId !== sectionId,
				),
			})

			// UIを閉じる
			close()

			// APIリクエストを実行
			await deleteSection(sectionId)
			onDelete?.(sectionId)
		} catch (error) {
			// エラー時は元の状態に戻す
			useResourceStore.setState({
				sections: previousSections,
				resources: previousResources,
			})
			console.error('Section delete error:', error)
			alert(
				error instanceof Error
					? error.message
					: 'セクションの削除に失敗しました。',
			)
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button className="hidden">Open Dialog</Button>
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
	)
}

export default DeleteSectionDialog
