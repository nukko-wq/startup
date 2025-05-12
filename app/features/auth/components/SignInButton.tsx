'use client'

import IconGoogle from '@/app/components/elements/IconGoogle'
import { Button } from 'react-aria-components'
import { useFormStatus } from 'react-dom'

const SignInButton = () => {
	const { pending } = useFormStatus()

	return (
		<Button
			className="flex w-[350px] grow cursor-pointer items-center justify-center p-4 outline-hidden hover:bg-gray-100 disabled:opacity-50"
			type="submit"
			isDisabled={pending}
		>
			<IconGoogle className="mr-2" />
			Google
		</Button>
	)
}

export default SignInButton
