import { File } from 'lucide-react'
import type { Section } from '@/app/lib/redux/features/section/types/section'

interface SectionItemProps {
	section: Section
}

const SectionItem = ({ section }: SectionItemProps) => {
	return (
		<div className="min-w-[260px] max-w-[920px] w-full pl-[16px] pr-[32px] py-5 outline-none">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center ml-4 cursor-grab" slot="drag">
					<File className="w-6 h-6 text-zinc-700" />
					<div className="text-sm text-zinc-700 ml-2">{section.name}</div>
				</div>
				<div className="hidden md:flex">リソース作成ボタン</div>
			</div>
		</div>
	)
}

export default SectionItem
