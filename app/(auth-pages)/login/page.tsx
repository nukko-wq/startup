import SignInForm from '@/app/features/auth/components/SignInForm'

export default async function Login() {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<SignInForm />
		</div>
	)
}
