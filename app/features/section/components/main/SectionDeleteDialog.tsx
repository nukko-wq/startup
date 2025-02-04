import { deleteSection as deleteSectionAPI } from '@/app/lib/redux/features/section/sectionAPI'
import { setSections } from '@/app/lib/redux/features/section/sectionSlice'
import { deleteSection as deleteSectionAction } from '@/app/lib/redux/features/section/sectionSlice'
import type { Section } from '@/app/lib/redux/features/section/types/section'
import { useAppDispatch } from '@/app/lib/redux/hooks'
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

interface SectionDeleteDialogProps {
	isOpen: boolean
	onClose: () => void
	section: Section
}

const SectionDeleteDialog = ({
	isOpen,
	onClose,
	section,
}: SectionDeleteDialogProps) => {
	const dispatch = useAppDispatch()
	const [isDeleting, setIsDeleting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const handleDelete = async () => {
		try {
			setIsDeleting(true)
			setError(null)

			dispatch(deleteSectionAction(section.id))

			try {
				await deleteSectionAPI(section.id)
				onClose()
			} catch (error) {
				const rollbackSections = await fetch('/api/sections').then((res) =>
					res.json(),
				)
				dispatch(setSections(rollbackSections))
				throw error
			}
		} catch (error) {
			console.error('セクションの削除に失敗しました:', error)
			setError(error instanceof Error ? error : new Error('削除に失敗しました'))
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<DialogTrigger isOpen={isOpen}>
			<Button className="hidden">Open Dialog</Button>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur-sm">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog role="alertdialog" className="outline-hidden relative">
						{({ close }) => (
							<>
								<Heading className="text-xl font-semibold leading-6 my-0 text-slate-700">
									セクションの削除
								</Heading>
								<div className="w-6 h-6 text-red-500 absolute right-0 top-0">
									<AlertTriangle className="w-6 h-6" />
								</div>
								<p className="mt-3 text-slate-500">
									このセクションを削除してもよろしいですか？この操作は取り消せません。
								</p>
								{error && (
									<p className="mt-2 text-red-500 text-sm">{error.message}</p>
								)}
								<div className="mt-6 flex justify-end gap-2">
									<Button
										onPress={onClose}
										className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 outline-hidden cursor-pointer"
										isDisabled={isDeleting}
									>
										キャンセル
									</Button>
									<Button
										onPress={handleDelete}
										className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 outline-hidden cursor-pointer"
										isDisabled={isDeleting}
									>
										{isDeleting ? '削除中...' : '削除'}
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

export default SectionDeleteDialog
