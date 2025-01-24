'use client'

import SectionList from '@/app/features/section/components/main/SectionList'
import { createSection } from '@/app/lib/redux/features/section/sectionAPI'
import {
	addSection,
	deleteSection,
} from '@/app/lib/redux/features/section/sectionSlice'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import { Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Button } from 'react-aria-components'
import { v4 as uuidv4 } from 'uuid'

const SectionListWrapper = () => {
	const dispatch = useAppDispatch()
	const params = useParams()
	const spaceId = params.spaceId as string
	const { sections, isLoaded } = useAppSelector(selectSectionsByActiveSpace)

	const handleCreateSection = async () => {
		const optimisticSection = {
			id: uuidv4(),
			name: 'Resources',
			spaceId,
			order: sections.length,
			userId: '',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		dispatch(addSection(optimisticSection))

		try {
			const newSection = await createSection('Resources', spaceId)
			dispatch(deleteSection(optimisticSection.id))
			dispatch(addSection(newSection))
		} catch (error) {
			dispatch(deleteSection(optimisticSection.id))
			console.error('セクションの作成に失敗しました:', error)
		}
	}

	return (
		<div className="flex w-full max-w-[920px] grow flex-col overflow-y-auto py-5 pr-[32px] pl-[16px]">
			<div className="flex w-full flex-col">
				<SectionList />
			</div>
			{isLoaded && (
				<div className="mt-4 flex justify-center">
					<Button
						onPress={handleCreateSection}
						className="flex items-center gap-1 px-4 py-2 text-gray-500 outline-hidden transition-colors hover:text-gray-700 cursor-pointer"
					>
						<Plus className="h-3 w-3" />
						<span>RESOURCE SECTION</span>
					</Button>
				</div>
			)}
		</div>
	)
}

export default SectionListWrapper
