'use client'

import { AlignJustify, LogOut } from 'lucide-react'
import React from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import { handleSignOut } from '@/app/features/auth/actions/auth'

const SidebarMenu = () => {
	const onSignOut = async () => {
		await handleSignOut()
	}

	return (
		<MenuTrigger>
			<Button className="outline-none text-zinc-50" aria-label="Menu">
				<AlignJustify className="w-5 h-5 text-zinc-50" />
			</Button>
			<Popover>
				<Menu
					onAction={(key) => {
						if (key === 'logout') {
							onSignOut()
						}
					}}
					className="p-3 outline-none bg-zinc-200 rounded-md shadow-md min-w-[120px] hover:bg-zinc-300"
				>
					<MenuItem id="logout" className="outline-none cursor-pointer rounded">
						<div className="flex items-center">
							<LogOut className="w-4 h-4 text-zinc-900" />
							<span className="ml-2 text-sm text-zinc-900">Log Out</span>
						</div>
					</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	)
}

export default SidebarMenu
