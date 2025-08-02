import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { fetchInitialData } from '@/app/(dashboard)/utils/fetchInitialData'
import DashboardLayout from '@/app/(dashboard)/components/DashboardLayout'
import { logger } from '@/lib/secure-logger'

export const dynamic = 'force-dynamic'

export default async function Home() {
	// 認証チェックを最初に実行（redirectの例外を避けるため）
	const user = await getCurrentUser()
	if (!user) {
		logger.auth.info('未認証ユーザーをログインページにリダイレクト')
		redirect('/login')
	}

	try {
		const { initialWorkspace, activeSpace } = await fetchInitialData(user.id)

		return (
			<DashboardLayout
				initialWorkspaces={initialWorkspace}
				activeSpaceId={activeSpace?.id}
			/>
		)
	} catch (error) {
		logger.app.error('ホームページでデータ取得エラー:', error)
		// データ取得エラーの場合はログインページにリダイレクト
		redirect('/login')
	}
}
