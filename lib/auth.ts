import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || []

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Google],
	callbacks: {
		async signIn({ user }) {
			return allowedEmails.includes(user.email ?? '')
		},
	},
})
