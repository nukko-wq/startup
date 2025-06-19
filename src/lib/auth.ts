import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') ?? []

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
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
		error: '/error',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			// console.log('Sign in callback: ', user)
			// console.log('User email:', user.email)

			if (!allowedEmails.includes(user.email ?? '')) {
				console.log('Email not allowed')
				return false
			}
			try {
				if (!account || !user.email) {
					console.error('Invalid account or user email')
					return false
				}

				const existingUser = await prisma.user.findUnique({
					where: { email: user.email },
					include: { accounts: true },
				})

				if (existingUser) {
					await prisma.account.update({
						where: {
							provider_providerAccountId: {
								provider: 'google',
								providerAccountId: account.providerAccountId,
							},
						},
						data: {
							access_token: account.access_token,
							refresh_token: account.refresh_token,
							expires_at: account.expires_at,
							scope: account.scope,
							token_type: account.token_type,
							id_token: account.id_token,
						},
					})
				} else {
					await prisma.user.create({
						data: {
							email: user.email,
							name: user.name,
							accounts: {
								create: {
									type: account.type ?? 'oauth',
									provider: 'google',
									providerAccountId: account.providerAccountId,
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
			if (session.user) {
				session.user.id = token.id as string
				session.accessToken = token.accessToken as string
				session.refreshToken = token.refreshToken as string
				session.expiresAt = token.expiresAt as number
			}
			return session
		},
		async jwt({ token, account, user }) {
			if (account && user && user.id) {
				token.id = user.id
				token.accessToken = account.access_token
				token.refreshToken = account.refresh_token
				token.expires_at = account.expires_at
			}
			return token
		},
		async authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user
			const isOnLoginPage = nextUrl.pathname === '/login'

			if (isLoggedIn && isOnLoginPage) {
				return Response.redirect(new URL('/', nextUrl))
			}

			if (!isLoggedIn && !isOnLoginPage) {
				return Response.redirect(new URL('/login', nextUrl))
			}

			return true
		},
	},
})
