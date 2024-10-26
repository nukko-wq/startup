import { signOut } from '@/lib/auth'
import SignOutButton from '@/app/features/auth/components/signout-button'

export function SignOut() {
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
