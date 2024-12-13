import { GripVertical } from 'lucide-react'
import React from 'react'
import { Button } from 'react-aria-components'
import { useSelector } from 'react-redux'
import { selectSpacesByWorkspaceId } from '@/app/lib/redux/features/space/selector'

interface SpaceListProps {
	workspaceId: string
}

const SpaceList = ({ workspaceId }: SpaceListProps) => {
	const spaces = useSelector((state) =>
		selectSpacesByWorkspaceId(state, workspaceId),
	)

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
							
						`}
					>
						<div className="flex flex-grow items-center justify-between py-1 group">
							<div className="flex items-center flex-grow">
								<div className="flex items-center cursor-grab">
									<Button
										className="cursor-grab flex items-center pr-3"
										aria-label="drag handle"
									>
										<GripVertical className="w-4 h-4 text-zinc-500" />
									</Button>
								</div>
								<div className="text-left text-sm">{space.name}</div>
							</div>
							<div className="opacity-0 group-hover:opacity-100">
								Space Menu
							</div>
						</div>
					</div>
				))
			)}
		</div>
	)
}

export default SpaceList
