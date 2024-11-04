'use client'

import HeaderMenu from '@/app/features/header/header_menu/HeaderMenu'

interface HeaderProps {
	spaceName: string
	spaceId: string
}

export default function Header({ spaceName, spaceId }: HeaderProps) {
	return (
		<div className="flex items-center justify-between p-4 w-full">
			<div className="text-lg font-bold pl-4 text-zinc-800">{spaceName}</div>
			<HeaderMenu spaceId={spaceId} spaceName={spaceName} />
		</div>
	)
}
