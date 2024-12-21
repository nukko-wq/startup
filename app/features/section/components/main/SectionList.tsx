'use client'

import { useAppSelector } from '@/app/lib/redux/hooks'
import SectionItem from '@/app/features/section/components/main/SectionItem'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'

const SectionList = () => {
	const sections = useAppSelector(selectSectionsByActiveSpace)

	return (
		<div className="flex flex-col w-full gap-6">
			{/*TODO: セクションのドラッグ&ドロップを実装する */}
			{sections.map((section) => (
				<div key={section.id} className="outline-none group">
					<SectionItem section={section} />
				</div>
			))}
		</div>
	)
}

export default SectionList
