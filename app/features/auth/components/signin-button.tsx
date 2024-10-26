'use client'

import { Button } from 'react-aria-components'
import { Icon } from '@/app/components/elements/icon'
import { useFormStatus } from 'react-dom'

const SignInButton = () => {
	const { pending } = useFormStatus()

	return (
		<Button
			className="flex flex-grow items-center p-4 justify-center hover:bg-gray-100 outline-none disabled:opacity-50"
			type="submit"
			isDisabled={pending}
		>
			{pending ? (
				<Icon.spinner className="animate-spin" />
			) : (
				<Icon.google className="mr-2" />
			)}
			Google
		</Button>
	)
}

export default SignInButton
