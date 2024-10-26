import { signIn } from '@/lib/auth'
import SignInButton from '@/app/features/auth/components/sign-in-button'

export default function SignInForm() {
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
		</div>
	)
}
