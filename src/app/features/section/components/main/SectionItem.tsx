import ResourceCreateButton from '@/app/features/resource/components/main/ResourceCreateButton'
import ResourceList from '@/app/features/resource/components/main/ResourceList'
import SectionMenu from '@/app/features/section/components/main/SectionMenu'
import SectionNameEdit from '@/app/features/section/components/main/SectionNameEdit'
import type { Section } from '@/app/lib/redux/features/section/types/section'
import { File } from 'lucide-react'
import { useRef } from 'react'

interface SectionItemProps {
	section: Section
}

const SectionItem = ({ section }: SectionItemProps) => {
	const resourceCreateButtonRef = useRef<HTMLButtonElement>(null)

	const handleAddResourceClick = () => {
		resourceCreateButtonRef.current?.click()
	}

	return (
		<div className="mb-6 w-full min-w-[260px] max-w-[920px] outline-hidden">
			<div className="mb-2 flex items-center justify-between">
				<div className="ml-4 flex cursor-grab items-center" slot="drag">
					<File className="h-6 w-6 text-slate-700" />
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
