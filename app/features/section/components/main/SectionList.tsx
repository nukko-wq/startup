'use client'

import { useSelector } from 'react-redux'
import SectionItem from '@/app/features/section/components/main/SectionItem'

const SectionList = () => {
	const sections = useSelector((state) => state.section.sections)
	const activeSpaceId = useSelector((state) => state.space.activeSpaceId)

	const filteredSections = sections.filter(
		(section) => section.spaceId === activeSpaceId,
	)

	return (
		<div className="flex flex-col w-full gap-2">
			{filteredSections.map((section) => (
				<div key={section.id} className="outline-none group">
					<SectionItem section={section} />
				</div>
			))}
		</div>
	)
}

export default SectionList
