'use client'

import { Plus } from 'lucide-react'
import { Button } from 'react-aria-components'
import SectionList from '@/app/features/section/components/main/SectionList'

const SectionListWrapper = () => {
	return (
		<div className="flex flex-col flex-grow w-full max-w-[920px] overflow-y-auto">
			<div className="flex flex-col w-full">
				<SectionList />
			</div>
			<div className="flex justify-center mt-4">
				<Button className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500 hover:text-gray-700 transition-colors">
					<Plus className="w-3 h-3" />
					<span>RESOURCE SECTION</span>
				</Button>
			</div>
		</div>
	)
}

export default SectionListWrapper
