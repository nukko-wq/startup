'use client'

import { memo } from 'react'
import Sidebar from '@/app/components/sidebar/sidebar'
import Header from '@/app/components/header/Header'
import { Suspense } from 'react'
import TabList from '@/app/features/tabs/components/main/TabList'
import SectionListWrapper from '@/app/features/section/components/main/SectionListWrapper'

const TabListFallback = () => (
	<div className="flex justify-center w-1/2">
		<div className="flex-grow py-5 pr-[16px] pl-[32px] max-w-[920px] animate-pulse">
			<div className="h-[400px] bg-gray-100 rounded-md" />
		</div>
	</div>
)

const DashboardContent = memo(() => {
	return (
		<div className="flex w-full h-full">
			<div className="flex flex-col w-full h-full">
				<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
					<Sidebar />
					<main className="flex flex-col flex-grow items-center bg-slate-100">
						<Header />
						<div className="flex flex-grow w-full h-[calc(100vh-68px)]">
							<Suspense fallback={<TabListFallback />}>
								<TabList />
							</Suspense>
							<div className="flex justify-center w-1/2">
								<SectionListWrapper />
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	)
})

DashboardContent.displayName = 'DashboardContent'

export default DashboardContent
