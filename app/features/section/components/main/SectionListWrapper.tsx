'use client'

import { Plus } from 'lucide-react'
import { Button } from 'react-aria-components'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { addSection } from '@/app/lib/redux/features/section/sectionSlice'
import { createSection } from '@/app/lib/redux/features/section/sectionAPI'
import SectionList from '@/app/features/section/components/main/SectionList'
import { useParams } from 'next/navigation'

const SectionListWrapper = () => {
	const dispatch = useAppDispatch()
	const params = useParams()
	const spaceId = params.spaceId as string

	const handleCreateSection = async () => {
		try {
			const newSection = await createSection('Resources', spaceId)
			dispatch(addSection(newSection))
		} catch (error) {
			console.error('セクションの作成に失敗しました:', error)
		}
	}

	return (
		<div className="flex flex-col flex-grow w-full max-w-[920px] overflow-y-auto">
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
