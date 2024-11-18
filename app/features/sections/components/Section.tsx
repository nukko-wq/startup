'use client'

import ResourceCreateButton from '@/app/features/resources/create_resource/components/ResourceCreateButton'
import ResourceItem from '@/app/features/resources/components/ResourceItem'
import { File } from 'lucide-react'
import { useRef, useState, useMemo } from 'react'
import SectionMenuButton from '@/app/features/sections/section_menu/SectionMenuButton'
import SectionNameEdit from '@/app/features/sections/edit_section/components/SectionNameEdit'
import { Button } from 'react-aria-components'
import { useResourceStore } from '@/app/store/resourceStore'
import { memo } from 'react'
import { useEffect } from 'react'

interface SectionProps {
	id: string
	name: string
	onDelete: (sectionId: string) => void
	resources: Array<{
		id: string
		title: string
		description: string | null
		url: string
		faviconUrl: string | null
		mimeType: string | null
		isGoogleDrive: boolean
		position: number
		sectionId: string
	}>
}

export default memo(function Section({
	id,
	name,
	onDelete,
	resources,
}: SectionProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [sectionName, setSectionName] = useState(name)
	const [isResourceCreateOpen, setIsResourceCreateOpen] = useState(false)

	const sectionResources = useMemo(() => {
		return [...resources].sort((a, b) => a.position - b.position)
	}, [resources])

	const handleNameEdit = (newName: string) => {
		setSectionName(newName)
	}

	const handleDelete = async () => {
		try {
			const deletePromise = onDelete(id)
			await deletePromise
		} catch (error) {
			console.error('セクション削除エラー:', error)
			const message =
				error instanceof Error
					? error.message
					: 'セクションの削除に失敗しました。もう一度お試しください。'
			alert(message)
		}
	}

	return (
		<div
			ref={ref}
			className="min-w-[260px] max-w-[920px] w-full pl-[16px] pr-[32px] py-5 outline-none"
		>
			<div className="flex justify-between items-center mb-2 cursor-grab">
				<div className="flex items-center ml-4">
					<Button
						slot="drag"
						aria-label="ドラッグハンドル"
						className="cursor-grab"
					>
						<File className="w-6 h-6 text-zinc-700" />
					</Button>
					<SectionNameEdit
						initialName={sectionName}
						sectionId={id}
						onEdit={handleNameEdit}
					/>
				</div>
				<div className="hidden md:flex">
					<ResourceCreateButton
						sectionId={id}
						isOpen={isResourceCreateOpen}
						onOpenChange={setIsResourceCreateOpen}
					/>
					<SectionMenuButton
						sectionId={id}
						onDelete={handleDelete}
						onResourceCreate={() => setIsResourceCreateOpen(true)}
					/>
				</div>
			</div>
			<ResourceItem resources={sectionResources} sectionId={id} />
		</div>
	)
})
