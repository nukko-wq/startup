import { auth, signIn } from '@/lib/auth'
import SignInButton from '@/app/features/auth/components/signin-button'

export default async function SignInForm() {
	const session = await auth()

	return (
		<div className="w-[350px] border border-border rounded-lg">
			<form
				className="flex justify-center"
				action={async () => {
					'use server'
					await signIn('google')
				}}
			>
				<SignInButton />
			</form>
			{session?.user?.name}
		</div>
	)
}
