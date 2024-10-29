'use client'

import type { Resource } from '@prisma/client'
import ResourceEditMenu from '@/app/features/resources/edit_resource/components/ResourceEditMenu'
import ResourceDeleteButton from '@/app/features/resources/delete_resource/components/ResourceDeleteButton'
import { Link, GridList, GridListItem, Button } from 'react-aria-components'
import Image from 'next/image'
import pageOutline from '@/app/public/images/page_outline_white.png'
import { useListData } from 'react-stately'
import { GripVertical } from 'lucide-react'

interface ResourceItemProps {
	resource: Pick<
		Resource,
		'id' | 'title' | 'description' | 'url' | 'faviconUrl'
	>[]
}

export default function ResourceItem({ resource }: ResourceItemProps) {
	const list = useListData({
		initialItems: resource,
	})

	return (
		<GridList
			aria-label="Resources"
			selectionMode="none"
			items={list.items}
			className="w-full"
		>
			{(item) => (
				<GridListItem className="outline-none">
					<div className="flex justify-between items-center p-1 border-b border-gray-200 last:border-b-0 hover:bg-zinc-100">
						<div className="flex flex-grow flex-col p-1 ml-1">
							<Button slot="drag" className="">
								<GripVertical className="w-4 h-4" />
							</Button>
							<Link href={item.url} target="_blank" className="outline-none">
								<div className="flex items-end gap-2">
									{item.faviconUrl ? (
										<div className="relative w-8 h-8 p-1 top-[2px]">
											<Image
												src={pageOutline}
												width={32}
												height={32}
												alt="page_outline"
												className="absolute -left-1 -top-1 h-[32px] w-[32px]"
											/>
											<img
												src={item.faviconUrl}
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
										<div>{item.title}</div>
										<div className="text-xs text-muted-foreground">
											{item.description || 'Webpage'}
										</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="flex items-center">
							<ResourceEditMenu resource={item} />
							<ResourceDeleteButton resource={item} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}
