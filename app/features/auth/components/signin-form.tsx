'use client'

import { signIn } from 'next-auth/react'
import SignInButton from '@/app/features/auth/components/signin-button'

export default function SignInForm() {
	return (
		<div className="w-[350px] border border-border rounded-lg">
			<form
				className="flex justify-center"
				onSubmit={async (e) => {
					e.preventDefault()
					await signIn('google', { callbackUrl: '/' })
				}}
			>
				<SignInButton />
			</form>
		</div>
	)
}
