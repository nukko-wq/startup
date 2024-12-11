'use client'

import { Link } from 'react-aria-components'
import WorkspaceList from '@/app/components/sidebar/WorkspaceList'

const sidebar = () => {
	return (
		<div className="hidden md:flex flex-col min-h-screen bg-gray-800">
			<div className="flex items-center justify-between pl-4 pr-3 pt-4 pb-4">
				<Link
					href="/"
					className="text-zinc-50 text-2xl font-semibold outline-none"
				>
					Startup
				</Link>
			</div>
			<WorkspaceList />
		</div>
	)
}

export default sidebar
