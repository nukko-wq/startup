'use client'

import { useEffect, useCallback } from 'react'
import { Link } from 'react-aria-components'
import { useSpaceStore } from '@/app/store/spaceStore'
import { useWorkspaceStore } from '@/app/store/workspaceStore'
import { useResourceStore } from '@/app/store/resourceStore'
import type { Workspace } from '@/app/types/workspace'
import type { Space } from '@/app/types/space'
import SidebarMenu from './SidebarMenu'
import dynamic from 'next/dynamic'

const DynamicWorkspaces = dynamic(() => import('./Workspaces'), { ssr: false })
const DynamicSpaces = dynamic(() => import('./Spaces'), { ssr: false })

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
	const workspaces = useWorkspaceStore((state) => state.workspaces)
	const initializeSpaces = useSpaceStore((state) => state.initializeSpaces)
	const initializeWorkspaces = useWorkspaceStore(
		(state) => state.initializeWorkspaces,
	)
	const prefetchResourceData = useResourceStore(
		(state) => state.prefetchResourceData,
	)

	const handleSpaceHover = useCallback(
		(spaceId: string) => {
			prefetchResourceData(spaceId)
		},
		[prefetchResourceData],
	)

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
		<div className="hidden md:flex bg-gray-800 h-screen flex-col">
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
				<DynamicWorkspaces onSpaceHover={handleSpaceHover} />
			</div>
		</div>
	)
}
