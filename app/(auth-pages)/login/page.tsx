import SignInForm from '@/app/features/auth/components/SignInForm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Login() {
	// セッショントークンの確認
	const cookieStore = await cookies()
	const authCookie = cookieStore.get('next-auth.session-token')

	if (authCookie) {
		return redirect('/')
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<SignInForm />
		</div>
	)
}
