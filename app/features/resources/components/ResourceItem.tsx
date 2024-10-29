'use client'

import type { Resource } from '@prisma/client'
import ResourceEditMenu from '@/app/features/resources/edit_resource/components/ResourceEditMenu'
import ResourceDeleteButton from '@/app/features/resources/delete_resource/components/ResourceDeleteButton'
import { Link } from 'react-aria-components'
import Image from 'next/image'
import pageOutline from '@/app/public/images/page_outline_white.png'

interface ResourceItemProps {
	resource: Pick<
		Resource,
		'id' | 'title' | 'description' | 'url' | 'faviconUrl'
	>
}

export default function ResourceItem({ resource }: ResourceItemProps) {
	return (
		<div className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-zinc-100">
			<div className="flex flex-grow flex-col p-1 ml-1">
				<Link href={resource.url} target="_blank" className="outline-none">
					<div className="flex items-end gap-2">
						{resource.faviconUrl ? (
							<div className="relative w-8 h-8 p-1 top-[2px]">
								<Image
									src={pageOutline}
									width={32}
									height={32}
									alt="page_outline"
									className="absolute -left-1 -top-1 h-[32px] w-[32px]"
								/>
								<img
									src={resource.faviconUrl}
									alt="Favicon"
									className="relative h-[16px] w-[16px]"
								/>
							</div>
						) : (
							<div className="relative w-8 h-8 p-1 top-[2px]">
								<Image
									src={pageOutline}
									width={32}
									height={32}
									alt="page_outline"
									className="absolute -left-1 -top-1 h-[32px] w-[32px]"
								/>
								<span className="relative material-symbols-outlined text-[18px] -left-[1px] text-muted-foreground">
									public
								</span>
							</div>
						)}
						<div className="flex flex-col">
							<div>{resource.title}</div>
							<div className="text-xs text-muted-foreground">
								{resource.description || 'Webpage'}
							</div>
						</div>
					</div>
				</Link>
			</div>
			<div className="flex items-center">
				<ResourceEditMenu resource={resource} />
				<ResourceDeleteButton resource={resource} />
			</div>
		</div>
	)
}
