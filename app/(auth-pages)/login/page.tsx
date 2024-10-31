import SignInForm from '@/app/features/auth/components/signin-form'

export default async function Login(props: { searchParams: Promise<Message> }) {
	const searchParams = await props.searchParams
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<SignInForm />
		</div>
	)
}
