// localhost:3000/space/[spaceId]/page.tsx

import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { fetchSpaceData } from '@/app/(dashboard)/utils/fetchInitialData'
import DashboardLayout from '@/app/(dashboard)/components/DashboardLayout'
import { logger } from '@/lib/secure-logger'

export const dynamic = 'force-dynamic'

export default async function SpacePage({
	params,
}: {
	params: Promise<{ spaceId: string }>
}) {
	// 認証チェックを最初に実行（redirectの例外を避けるため）
	const user = await getCurrentUser()
	if (!user) {
		redirect('/login')
	}

	const resolvedParams = await params
	const spaceId = resolvedParams.spaceId

	try {
		const { initialWorkspace } = await fetchSpaceData(user.id, spaceId)

		return (
			<DashboardLayout
				initialWorkspaces={initialWorkspace}
				activeSpaceId={spaceId}
			/>
		)
	} catch (error) {
		if ((error as Error).message === 'Space not found') {
			return notFound()
		}
		
		// データ取得エラーをログに記録
		logger.app.error('SpacePageでデータ取得エラー:', error)
		
		// データ取得に失敗した場合はホームページにリダイレクト
		redirect('/')
	}
}
