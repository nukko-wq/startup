'use client'

import { Button } from 'react-aria-components'
import { Icon } from '@/components/elements/icon'

const SignInButton = () => {
	return (
		<Button
			className="flex flex-grow items-center p-4 justify-center hover:bg-gray-100 outline-none"
			type="submit"
		>
			<Icon.google className="mr-2" />
			Google
		</Button>
	)
}

export default SignInButton
