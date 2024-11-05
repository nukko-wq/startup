'use client'

import { handleSignOut } from '@/app/features/auth/actions/auth'
import { AlignJustify, LogOut } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'

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
				<Menu className="p-1 outline-none bg-zinc-200 rounded-md shadow-md">
					<MenuItem
						className="m-1 p-1 outline-none cursor-pointer"
						onAction={onSignOut}
					>
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
