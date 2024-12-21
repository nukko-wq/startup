import { File } from 'lucide-react'
import { useRef } from 'react'
import type { Section } from '@/app/lib/redux/features/section/types/section'
import SectionMenu from '@/app/features/section/components/main/SectionMenu'
import SectionNameEdit from '@/app/features/section/components/main/SectionNameEdit'
import ResourceList from '@/app/features/resource/components/main/ResourceList'
import ResourceCreateButton from '@/app/features/resource/components/main/ResourceCreateButton'

interface SectionItemProps {
	section: Section
}

const SectionItem = ({ section }: SectionItemProps) => {
	const resourceCreateButtonRef = useRef<HTMLButtonElement>(null)

	const handleAddResourceClick = () => {
		resourceCreateButtonRef.current?.click()
	}

	return (
		<div className="min-w-[260px] max-w-[920px] w-full outline-none mb-6">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center ml-4 cursor-grab" slot="drag">
					<File className="w-6 h-6 text-slate-700" />
					<SectionNameEdit section={section} />
				</div>
				<div className="hidden md:flex">
					<ResourceCreateButton
						ref={resourceCreateButtonRef}
						section={section}
					/>
					<SectionMenu
						section={section}
						onAddResourceClick={handleAddResourceClick}
					/>
				</div>
			</div>
			<ResourceList sectionId={section.id} />
		</div>
	)
}

export default SectionItem
