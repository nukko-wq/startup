import SignIn from '@/app/components/elements/SignIn/SignIn'
import { auth } from '@/auth'
import Sidebar from '@/app/components/layouts/Sidebar/Sidebar'

export default async function Home() {
	const session = await auth()
	return (
		<div className="flex flex-col min-h-screen">
			<main className="flex bg-slate-100 flex-grow">
				<Sidebar />
				<div className="flex flex-col flex-grow items-center justify-center">
					{session ? '' : <SignIn />}
				</div>
			</main>
		</div>
	)
}
