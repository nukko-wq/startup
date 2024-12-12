import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') ?? []

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(db),
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID ?? '',
			clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
			authorization: {
				params: {
					scope: [
						'https://www.googleapis.com/auth/userinfo.profile',
						'https://www.googleapis.com/auth/userinfo.email',
						'https://www.googleapis.com/auth/drive.readonly',
						'https://www.googleapis.com/auth/drive.metadata.readonly',
					].join(' '),
					access_type: 'offline',
					prompt: 'consent',
				},
			},
		}),
	],
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
		error: '/error',
	},
	callbacks: {
		async signIn({ user, account }) {
			try {
				if (!allowedEmails.includes(user.email ?? '')) {
					return false
				}
				return true
			} catch (error) {
				console.error('Error in signIn callback:', error)
				return false
			}
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub as string
				session.accessToken = token.accessToken as string
			}
			return session
		},
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token
			}
			return token
		},
		async redirect({ url, baseUrl }) {
			if (url.startsWith('/')) return `${baseUrl}${url}`
			if (new URL(url).origin === baseUrl) return url
			return baseUrl
		},
	},
	debug: process.env.NODE_ENV === 'development',
})
