import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import type { JWT } from 'next-auth/jwt'

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || []

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(db),
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
			authorization: {
				params: {
					scope: [
						'https://www.googleapis.com/auth/drive.readonly',
						'openid',
						'email',
						'profile',
					].join(' '),
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code',
				},
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
	},
	callbacks: {
		async signIn({ user }) {
			return allowedEmails.includes(user.email ?? '')
		},
		authorized: async ({ auth }) => {
			return !!auth
		},
		async jwt({ token, account, user }): Promise<JWT> {
			// 初回認証時
			if (account && user && user.id) {
				const newToken = {
					...token,
					id: user.id,
					accessToken: account.access_token ?? undefined,
					refreshToken: account.refresh_token ?? undefined,
					expiresAt: account.expires_at ?? undefined,
				}
				return newToken
			}

			if (!token.id) {
				throw new Error('Invalid token missing id')
			}
			return token
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id
				session.accessToken = token.accessToken
				session.refreshToken = token.refreshToken
				session.expiresAt = token.expiresAt
			}
			return session
		},
	},
	secret: process.env.AUTH_SECRET,
})
