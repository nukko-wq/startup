import type { User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
	interface Session {
		accessToken: string
		refreshToken: string
		expiresAt: number
		user: User & {
			id: string
			email: string
			name: string
		}
	}
}
