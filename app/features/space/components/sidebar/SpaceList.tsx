import { GripVertical } from 'lucide-react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import { selectSpacesByWorkspaceId } from '@/app/lib/redux/features/space/selector'
import { setActiveSpace } from '@/app/lib/redux/features/space/spaceSlice'
import SpaceMenu from '@/app/features/space/components/sidebar/SpaceMenu'

interface SpaceListProps {
	workspaceId: string
}

const SpaceList = ({ workspaceId }: SpaceListProps) => {
	const router = useRouter()
	const dispatch = useAppDispatch()
	const spaces = useAppSelector((state) =>
		selectSpacesByWorkspaceId(state, workspaceId),
	)
	const activeSpaceId = useAppSelector((state) => state.space.activeSpaceId)

	const handleSpaceClick = (spaceId: string) => {
		dispatch(setActiveSpace(spaceId))
		router.push(`/space/${spaceId}`)
	}

	return (
		<div className="flex flex-col min-h-[40px]">
			{spaces.length === 0 ? (
				<div className="ml-11 mr-4">Create a space</div>
			) : (
				spaces.map((space) => (
					<div
						key={space.id}
						className={`
							flex flex-grow justify-between text-gray-400 cursor-pointer 
							 hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200 pl-3
							${space.id === activeSpaceId ? 'bg-gray-700 bg-opacity-75' : ''}
						`}
						onClick={() => handleSpaceClick(space.id)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								handleSpaceClick(space.id)
							}
						}}
						// biome-ignore lint/a11y/useSemanticElements: <explanation>
						role="button"
						tabIndex={0}
					>
						<div className="flex flex-grow items-center justify-between py-1 group">
							<div className="flex items-center flex-grow">
								<div className="flex items-center cursor-grab">
									<div
										className="cursor-grab flex items-center pr-3"
										aria-label="drag handle"
									>
										<GripVertical className="w-4 h-4 text-slate-500" />
									</div>
								</div>
								<div className="text-left text-sm">{space.name}</div>
							</div>
							<div className="opacity-0 group-hover:opacity-100">
								<SpaceMenu spaceId={space.id} />
							</div>
						</div>
					</div>
				))
			)}
		</div>
	)
}

export default SpaceList
