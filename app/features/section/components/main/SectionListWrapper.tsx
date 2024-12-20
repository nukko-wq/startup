'use client'

import { Plus } from 'lucide-react'
import { Button } from 'react-aria-components'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import { v4 as uuidv4 } from 'uuid'
import {
	addSection,
	updateSection,
	deleteSection,
} from '@/app/lib/redux/features/section/sectionSlice'
import { createSection } from '@/app/lib/redux/features/section/sectionAPI'
import SectionList from '@/app/features/section/components/main/SectionList'
import { useParams } from 'next/navigation'
import type { RootState } from '@/app/lib/redux/store'

const SectionListWrapper = () => {
	const dispatch = useAppDispatch()
	const params = useParams()
	const spaceId = params.spaceId as string
	const sections = useAppSelector((state: RootState) => state.section.sections)

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
		<div className="flex flex-col flex-grow w-full max-w-[920px] overflow-y-auto py-5 pr-[32px] pl-[16px]">
			<div className="flex flex-col w-full">
				<SectionList />
			</div>
			<div className="flex justify-center mt-4">
				<Button
					onPress={handleCreateSection}
					className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500 hover:text-gray-700 transition-colors"
				>
					<Plus className="w-3 h-3" />
					<span>RESOURCE SECTION</span>
				</Button>
			</div>
		</div>
	)
}

export default SectionListWrapper
