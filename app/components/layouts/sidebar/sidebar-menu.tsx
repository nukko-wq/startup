'use client'

import { handleSignOut } from '@/app/features/auth/actions/auth'
import { LogOut } from 'lucide-react'
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
			<Button className="outline-none" aria-label="Menu">
				☰
			</Button>
			<Popover>
				<Menu className="p-1 outline-none bg-slate-200 rounded-md">
					<MenuItem
						className="m-1 p-1 outline-none cursor-pointer"
						onAction={onSignOut}
					>
						<div className="flex items-center">
							<LogOut className="w-4 h-4" />
							<span className="ml-2 text-sm">Log Out</span>
						</div>
					</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	)
}

export default SidebarMenu
