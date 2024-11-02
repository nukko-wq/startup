import { redirect } from 'next/navigation'
import Sidebar from '@/app/components/layouts/sidebar/sidebar'
import Resources from '@/app/features/resources/components/resources'
import { getInitialSections } from '@/app/features/resources/utils/getInitialSections'
import { auth } from '@/lib/auth'

// ページコンポーネントをキャッシュ化
export const revalidate = 0

export default async function Index() {
	const session = await auth()
	console.log('Session in Index:', session)

	if (!session?.user?.id) {
		redirect('/login')
	}

	try {
		const initialData = await getInitialSections(session.user.id)

		return (
			<div className="flex flex-col min-h-screen">
				<div className="flex bg-slate-50 flex-grow">
					<Sidebar />
					<main className="flex flex-col flex-grow items-center justify-center">
						<Resources initialData={initialData} />
					</main>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error in Index page:', error)
		if (
			error instanceof Error &&
			error.message === 'ユーザーが見つかりません'
		) {
			redirect('/login')
		}
		throw error
	}
}
