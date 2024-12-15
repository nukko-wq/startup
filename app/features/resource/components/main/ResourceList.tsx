import ResourceIcon from '@/app/components/elements/ResourceIcon'
import { GripVertical } from 'lucide-react'
import { Button } from 'react-aria-components'
import { useAppSelector } from '@/app/lib/redux/hooks'

const ResourceList = ({ sectionId }: { sectionId: string }) => {
	const resources = useAppSelector((state) =>
		state.resource.resources.filter(
			(resource) => resource.sectionId === sectionId,
		),
	)

	return (
		<div className="flex flex-col justify-center border-slate-400 rounded-md outline-none bg-white shadow-sm">
			{resources.length === 0 ? (
				<div className="flex flex-col justify-center items-center flex-grow h-[52px]">
					<div className="text-gray-500">Add resources here</div>
				</div>
			) : (
				resources.map((resource) => (
					<div
						key={resource.id}
						className="flex flex-grow flex-col outline-none cursor-pointer group/item"
					>
						<div className="grid grid-cols-[32px_1fr_74px] items-center px-1 pt-1 pb-2 border-b border-zinc-200 last:border-b-0 hover:bg-zinc-100">
							<div className="cursor-grab flex items-center p-2 opacity-0 group-hover/item:opacity-100">
								<Button className="cursor-grab">
									<GripVertical className="w-4 h-4 text-zinc-500" />
								</Button>
							</div>
							<div className="flex items-end gap-2 truncate">
								<ResourceIcon
									faviconUrl={resource.faviconUrl}
									mimeType={resource.mimeType}
									isGoogleDrive={resource.isGoogleDrive}
								/>
								<div className="flex flex-col truncate">
									<span className="truncate">{resource.title}</span>
									<span className="text-xs text-gray-400">
										{/* Description */}
									</span>
								</div>
							</div>
							<div className="flex items-center opacity-0 group-hover/item:opacity-100">
								Resource Menu
							</div>
						</div>
					</div>
				))
			)}
		</div>
	)
}

export default ResourceList
