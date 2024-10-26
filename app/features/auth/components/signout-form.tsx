import { signOut } from '@/lib/auth'
import SignOutButton from '@/app/features/auth/components/signout-button'

const SignOut = () => {
	return (
		<form
			action={async () => {
				'use server'
				await signOut()
			}}
		>
			<SignOutButton />
		</form>
	)
}

export default SignOut
