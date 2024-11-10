'use client'

import { useEffect } from 'react'
import { Link } from 'react-aria-components'
import { useSpaceStore } from '@/app/store/spaceStore'
import { useWorkspaceStore } from '@/app/store/workspaceStore'
import SidebarMenu from './SidebarMenu'
import Workspaces from './Workspaces'
import type { Space } from '@/app/types/space'
import type { Workspace } from '@/app/types/workspace'

interface SidebarProps {
	initialWorkspaces: Workspace[]
	initialSpaces: Space[]
	initialActiveSpaceId?: string
}

export default function Sidebar({
	initialWorkspaces,
	initialSpaces,
	initialActiveSpaceId,
}: SidebarProps) {
	const { initializeSpaces } = useSpaceStore()

	const { initializeWorkspaces } = useWorkspaceStore()

	// 初期データの読み込み
	useEffect(() => {
		if (initialWorkspaces.length > 0) {
			initializeWorkspaces(initialWorkspaces)
		}
		if (initialSpaces.length > 0) {
			initializeSpaces(initialSpaces, initialActiveSpaceId)
		}
	}, [
		initialWorkspaces,
		initialSpaces,
		initialActiveSpaceId,
		initializeWorkspaces,
		initializeSpaces,
	])

	return (
		<div className="hidden md:flex w-[320px] bg-gray-800 h-screen flex-col">
			<div className="flex items-center justify-between pl-4 pr-3 pt-4 pb-4">
				<Link
					href="/"
					className="text-zinc-50 text-2xl font-semibold outline-none"
				>
					Startup
				</Link>
				<SidebarMenu />
			</div>
			<div className="flex-grow">
				<Workspaces />
			</div>
		</div>
	)
}
