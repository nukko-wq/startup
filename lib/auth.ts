import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || []

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(db),
	providers: [Google],
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
		async jwt({ token, user }) {
			if (user?.id) {
				token.id = user.id
			}
			return token
		},
		async session({ token, session }) {
			if (token) {
				session.user.id = token.id
				session.user.name = token.name
				session.user.email = token.email ?? ''
				session.user.image = token.picture
			}
			return session
		},
	},
	secret: process.env.AUTH_SECRET,
})
