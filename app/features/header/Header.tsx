import React from 'react'

interface HeaderProps {
	spaceName: string
}

export default function Header({ spaceName }: HeaderProps) {
	return (
		<div className="flex items-center justify-between p-4 w-full">
			<div className="text-lg font-bold pl-4 text-zinc-800">{spaceName}</div>
		</div>
	)
}
