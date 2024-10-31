import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'

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
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token
			}
			return token
		},
		async session({ token, session }) {
			if (session.user) {
				session.user.id = token.id
			}
			session.accessToken = token.accessToken
			return session
		},
	},
	secret: process.env.AUTH_SECRET,
})
