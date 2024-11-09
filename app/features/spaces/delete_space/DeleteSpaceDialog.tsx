'use client'

import { AlertTriangle } from 'lucide-react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import { useRouter } from 'next/navigation'
import { useSpaceStore } from '@/app/store/spaceStore'
import type { Space } from '@/app/types/space'

interface DeleteSpaceDialogProps {
	spaceId: string
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
}

const DeleteSpaceDialog = ({
	spaceId,
	isOpen,
	onOpenChange,
}: DeleteSpaceDialogProps) => {
	const router = useRouter()
	const {
		spaces,
		setSpaces,
		activeSpaceId,
		setActiveSpaceId,
		setCurrentSpace,
	} = useSpaceStore()

	const handleDelete = async (close: () => void) => {
		try {
			const previousSpaces = [...spaces]
			const deletedSpace = spaces.find((space) => space.id === spaceId)

			const filteredSpaces = spaces.filter((space) => space.id !== spaceId)
			setSpaces(filteredSpaces)
			close()

			const remainingSpaces = previousSpaces.filter(
				(space) => space.id !== spaceId,
			)
			if (remainingSpaces.length > 0) {
				const nextSpace = remainingSpaces[0]
				setActiveSpaceId(nextSpace.id)
				setCurrentSpace(nextSpace)
				router.push(`/?spaceId=${nextSpace.id}`, { scroll: false })
			} else {
				setActiveSpaceId(null)
				setCurrentSpace(null)
				router.push('/')
			}

			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				setSpaces(previousSpaces)
				if (deletedSpace && deletedSpace.id === activeSpaceId) {
					setActiveSpaceId(deletedSpace.id)
					setCurrentSpace(deletedSpace)
				}
				throw new Error('Failed to delete space')
			}

			router.refresh()
		} catch (error) {
			console.error('Space delete error:', error)
			alert('スペースの削除に失敗しました。')
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
									スペースの削除
								</Heading>
								<div className="w-6 h-6 text-red-500 absolute right-0 top-0">
									<AlertTriangle className="w-6 h-6" />
								</div>
								<p className="mt-3 text-slate-500">
									このスペースを削除してもよろしいですか？この操作は取り消せません。
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

export default DeleteSpaceDialog
