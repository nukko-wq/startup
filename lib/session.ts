import { auth } from '@/lib/auth'
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
	try {
		const session = await auth()
		return session?.user
	} catch (error) {
		console.error('Error getting current user:', error)
		return null
	}
})
