'use client'

import { useSelector } from 'react-redux'
import SectionItem from '@/app/features/section/components/main/SectionItem'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'

const SectionList = () => {
	const sections = useSelector(selectSectionsByActiveSpace)

	return (
		<div className="flex flex-col w-full gap-2">
			{sections.map((section) => (
				<div key={section.id} className="outline-none group">
					<SectionItem section={section} />
				</div>
			))}
		</div>
	)
}

export default SectionList
