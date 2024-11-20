'use client'

import ResourceCreateButton from '@/app/features/resources/create_resource/components/ResourceCreateButton'
import ResourceItem from '@/app/features/resources/components/ResourceItem'
import { File } from 'lucide-react'
import { useRef, useState, useMemo, useCallback } from 'react'
import SectionMenuButton from '@/app/features/sections/section_menu/SectionMenuButton'
import SectionNameEdit from '@/app/features/sections/edit_section/components/SectionNameEdit'
import { Button } from 'react-aria-components'
import { useResourceStore } from '@/app/store/resourceStore'
import { memo } from 'react'
import { useEffect } from 'react'
import type { Section } from '@/app/types/section'

interface SectionProps {
	section: {
		id: string
		name: string
		order: number
		spaceId?: string | null | undefined
	}
	resources: {
		id: string
		title: string
		description: string | null
		url: string
		faviconUrl: string | null
		mimeType: string | null
		isGoogleDrive: boolean
		position: number
		sectionId: string
	}[]
}

export default memo(function Section({ section, resources }: SectionProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [sectionName, setSectionName] = useState(section.name)
	const [isResourceCreateOpen, setIsResourceCreateOpen] = useState(false)
	const deleteSection = useResourceStore((state) => state.deleteSection)

	const sortedResources = useMemo(() => {
		return [...resources].sort((a, b) => a.position - b.position)
	}, [resources])

	const handleNameEdit = (newName: string) => {
		setSectionName(newName)
	}

	const handleDelete = useCallback(async () => {
		try {
			await deleteSection(section.id)
		} catch (error) {
			console.error('セクション削除エラー:', error)
			const message =
				error instanceof Error
					? error.message
					: 'セクションの削除に失敗しました。'
			alert(message)
		}
	}, [section.id, deleteSection])

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
						sectionId={section.id}
						onEdit={handleNameEdit}
					/>
				</div>
				<div className="hidden md:flex">
					<ResourceCreateButton
						sectionId={section.id}
						isOpen={isResourceCreateOpen}
						onOpenChange={setIsResourceCreateOpen}
					/>
					<SectionMenuButton
						sectionId={section.id}
						onDelete={handleDelete}
						onResourceCreate={() => setIsResourceCreateOpen(true)}
					/>
				</div>
			</div>
			<ResourceItem resources={sortedResources} sectionId={section.id} />
		</div>
	)
})
