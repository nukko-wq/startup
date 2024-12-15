import { File } from 'lucide-react'
import type { Section } from '@/app/lib/redux/features/section/types/section'
import SectionMenu from '@/app/features/section/components/main/SectionMenu'
import SectionNameEdit from '@/app/features/section/components/main/SectionNameEdit'
import ResourceList from '@/app/features/resource/components/main/ResourceList'
import ResourceCreateButton from '@/app/features/resource/components/main/ResourceCreateButton'
interface SectionItemProps {
	section: Section
}

const SectionItem = ({ section }: SectionItemProps) => {
	return (
		<div className="min-w-[260px] max-w-[920px] w-full pl-[16px] pr-[32px] py-5 outline-none">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center ml-4 cursor-grab" slot="drag">
					<File className="w-6 h-6 text-zinc-700" />
					<SectionNameEdit section={section} />
				</div>
				<div className="hidden md:flex">
					<ResourceCreateButton section={section} />
					<SectionMenu section={section} />
				</div>
			</div>
			<ResourceList sectionId={section.id} />
		</div>
	)
}

export default SectionItem
