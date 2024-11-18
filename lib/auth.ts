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
		error: '/login',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			console.log('SignIn callback:', { user, account, profile })

			if (!allowedEmails.includes(user.email ?? '')) {
				return false
			}

			try {
				if (!account || !user.email) {
					console.error('Required account or user information missing')
					return false
				}

				const existingUser = await db.user.findFirst({
					where: {
						email: user.email,
					},
				})

				if (!existingUser) {
					await db.user.create({
						data: {
							email: user.email,
							name: user.name,
							accounts: {
								create: {
									type: account.type ?? 'oauth',
									provider: 'google',
									providerAccountId: account.providerAccountId ?? '',
									access_token: account.access_token,
									token_type: account.token_type,
									refresh_token: account.refresh_token,
									expires_at: account.expires_at,
									scope: account.scope,
									id_token: account.id_token,
								},
							},
						},
					})
				}

				return true
			} catch (error) {
				console.error('Error in signIn callback:', error)
				return false
			}
		},
		async session({ session, token }) {
			// console.log('Session callback:', { session, token })
			if (session.user) {
				session.user.id = token.id
				session.accessToken = token.accessToken
				session.refreshToken = token.refreshToken
				session.expiresAt = token.expiresAt
			}
			return session
		},
		async jwt({ token, account, user }) {
			// console.log('JWT callback:', { token, account, user })
			if (account && user && user.id) {
				token.id = user.id
				token.accessToken = account.access_token ?? undefined
				token.refreshToken = account.refresh_token ?? undefined
				token.expiresAt = account.expires_at ?? undefined
			}
			return token
		},
	},
	secret: process.env.AUTH_SECRET,
})
