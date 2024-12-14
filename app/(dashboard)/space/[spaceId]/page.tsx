// localhost:3000/space/[spaceId]/page.tsx

'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ReduxProvider } from '@/app/lib/redux/provider'
import Sidebar from '@/app/components/sidebar/sidebar'
import SectionListWrapper from '@/app/features/section/components/main/SectionListWrapper'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { setActiveSpace } from '@/app/lib/redux/features/space/spaceSlice'

// SpacePageの内部コンポーネントを作成
const SpacePageContent = () => {
	const params = useParams()
	const dispatch = useAppDispatch()
	const spaceId = params.spaceId as string

	useEffect(() => {
		if (spaceId) {
			dispatch(setActiveSpace(spaceId))
		}
	}, [dispatch, spaceId])

	return (
		<div className="flex w-full h-full">
			<div className="flex flex-col w-full h-full">
				<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
					<Sidebar />
					<main className="flex flex-col flex-grow items-center bg-slate-100">
						<div className="flex flex-grow w-full h-[calc(100vh-68px)]">
							<div className="flex justify-center w-1/2">Tab List</div>
							<div className="flex justify-center w-1/2">
								<SectionListWrapper />
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	)
}

// メインのSpacePageコンポーネント
const SpacePage = () => {
	return (
		<ReduxProvider>
			<SpacePageContent />
		</ReduxProvider>
	)
}

export default SpacePage
