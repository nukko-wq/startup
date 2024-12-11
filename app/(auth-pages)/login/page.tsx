import SignInForm from '@/app/features/auth/components/SignInForm'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
export default async function Login() {
	const user = await getCurrentUser()

	if (user) {
		return redirect('/')
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<SignInForm />
		</div>
	)
}
