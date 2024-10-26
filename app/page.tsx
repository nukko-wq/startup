import Hero from '@/components/hero'
import ConnectSupabaseSteps from '@/components/tutorial/connect-supabase-steps'
import SignUpUserSteps from '@/components/tutorial/sign-up-user-steps'
import { hasEnvVars } from '@/utils/supabase/check-env-vars'
import Sidebar from '@/app/components/layouts/sidebar/sidebar'

export default async function Index() {
	return (
		<div className="flex flex-col min-h-screen">
			<main className="flex bg-slate-50 flex-grow">
				<Sidebar />
				<div className="flex flex-col flex-grow items-center justify-center">
					<h2 className="font-medium text-xl mb-4">Next steps</h2>
				</div>
			</main>
		</div>
	)
}
