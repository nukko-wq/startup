import Hero from '@/components/hero'
import ConnectSupabaseSteps from '@/components/tutorial/connect-supabase-steps'
import SignUpUserSteps from '@/components/tutorial/sign-up-user-steps'
import { hasEnvVars } from '@/utils/supabase/check-env-vars'
import Sidebar from '@/app/components/layouts/sidebar/sidebar'
import Resources from '@/app/features/resources/components/resources'

export default async function Index() {
	return (
		<div className="flex flex-col min-h-screen">
			<div className="flex bg-slate-50 flex-grow">
				<Sidebar />
				<main className="flex flex-col flex-grow items-center justify-center">
					<Resources />
				</main>
			</div>
		</div>
	)
}
