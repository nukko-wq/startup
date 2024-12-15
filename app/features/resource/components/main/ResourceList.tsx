'use client'

import { useAppSelector } from '@/app/lib/redux/hooks'
import { selectSortedResourcesBySectionId } from '@/app/lib/redux/features/resource/selector'

interface ResourceListProps {
	sectionId: string
}

const ResourceList = ({ sectionId }: ResourceListProps) => {
	const resources = useAppSelector((state) =>
		selectSortedResourcesBySectionId(state, sectionId),
	)

	return (
		<div className="flex flex-col gap-2 p-2">
			{resources.length === 0 ? (
				<div className="flex justify-center items-center h-12 text-gray-400">
					No resources
				</div>
			) : (
				resources.map((resource) => (
					<div
						key={resource.id}
						className="flex items-center p-2 bg-white rounded-md shadow-sm"
					>
						{resource.faviconUrl && (
							<img src={resource.faviconUrl} alt="" className="w-4 h-4 mr-2" />
						)}
						<a
							href={resource.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:text-blue-800"
						>
							{resource.title}
						</a>
					</div>
				))
			)}
		</div>
	)
}

export default ResourceList
