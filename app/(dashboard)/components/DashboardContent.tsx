'use client'

import SpaceOverlay from '@/app/(dashboard)/components/SpaceOverlay'
import Header from '@/app/components/header/Header'
import Sidebar from '@/app/components/sidebar/sidebar'
import SectionListWrapper from '@/app/features/section/components/main/SectionListWrapper'
import TabList from '@/app/features/tabs/components/main/TabList'
import { showSpaceOverlay } from '@/app/lib/redux/features/overlay/overlaySlice'
import { memo, useEffect } from 'react'
import { Suspense } from 'react'
import { useDispatch } from 'react-redux'

interface ExtensionMessage {
	source: string
	type: string
}

const TabListFallback = () => (
	<div className="flex w-1/2 justify-center">
		<div className="max-w-[920px] grow animate-pulse py-5 pr-[16px] pl-[32px]">
			<div className="h-[400px] rounded-md bg-gray-100" />
		</div>
	</div>
)

const DashboardContent = memo(() => {
	const dispatch = useDispatch()

	useEffect(() => {
		const handleMessage = (event: MessageEvent<ExtensionMessage>) => {
			if (
				event.data.source === 'startup-extension' &&
				event.data.type === 'SHOW_SPACE_LIST_OVERLAY'
			) {
				console.log('Showing space overlay')
				dispatch(showSpaceOverlay())
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [dispatch])

	return (
		<div className="flex h-full w-full">
			<div className="flex h-full w-full flex-col">
				<div className="flex bg-slate-50 md:grid md:grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr]">
					<Sidebar />
					<main className="flex grow flex-col items-center bg-slate-100">
						<Header />
						<div className="flex h-[calc(100vh-70px)] w-full grow">
							<Suspense fallback={<TabListFallback />}>
								<TabList />
							</Suspense>
							<div className="flex w-full justify-center md:w-1/2">
								<SectionListWrapper />
							</div>
						</div>
					</main>
				</div>
			</div>
			<SpaceOverlay />
		</div>
	)
})

DashboardContent.displayName = 'DashboardContent'

export default DashboardContent
