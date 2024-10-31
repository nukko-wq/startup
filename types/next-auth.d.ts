import type { User } from 'next-auth'
import type { JWT as NextAuthJWT } from 'next-auth/jwt'

type UserId = string

declare module 'next-auth/jwt' {
	interface JWT {
		id: UserId
		name?: string | null
		email?: string | null
		picture?: string | null
		accessToken?: string
		refreshToken?: string
		expiresAt?: number
	}
}

declare module 'next-auth' {
	interface Session {
		user: User & {
			id: UserId
		}
		accessToken?: string
		refreshToken?: string
		expiresAt?: number
	}
	interface User {
		id: UserId
	}
}
