import SectionItem from '@/app/features/section/components/main/SectionItem'

const SectionList = () => {
	return (
		<div className="flex flex-col w-full gap-2">
			{sections.map((section, index) => (
				<div key={index} className="outline-none group">
					<SectionItem />
				</div>
			))}
		</div>
	)
}

export default SectionList
