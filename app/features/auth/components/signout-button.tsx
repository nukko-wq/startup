'use client'

import { Button } from 'react-aria-components'

const SignOutButton = () => {
	return (
		<Button
			className="flex flex-grow items-center p-4 justify-center hover:bg-gray-100 outline-none disabled:opacity-50"
			type="submit"
		>
			Sign Out
		</Button>
	)
}

export default SignOutButton
