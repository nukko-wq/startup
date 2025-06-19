import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { secureLogger } from '@/lib/secure-logger'

const allowedEmails = env.ALLOWED_EMAILS.split(',').map(email => email.trim())

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	debug: process.env.NODE_ENV === 'development',
	providers: [
		Google({
			clientId: env.AUTH_GOOGLE_ID,
			clientSecret: env.AUTH_GOOGLE_SECRET,
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
			secureLogger.auth.info('Sign in attempt started', user)

			if (!allowedEmails.includes(user.email ?? '')) {
				secureLogger.auth.warn('Access denied: Email not in allowed list', { email: user.email })
				return false
			}

			try {
				if (!account || !user.email) {
					secureLogger.auth.error('Authentication failed: Invalid account data', { 
						hasAccount: !!account, 
						hasEmail: !!user.email 
					})
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
				secureLogger.auth.error('Authentication failed: Database error occurred', error)
				return false
			}
		},
		async session({ session, token }) {
			if (session.user) {
				// 型安全性の向上：適切なnullチェックを追加
				if (token.id && typeof token.id === 'string') {
					session.user.id = token.id
				}
				if (token.accessToken && typeof token.accessToken === 'string') {
					session.accessToken = token.accessToken
				}
				if (token.refreshToken && typeof token.refreshToken === 'string') {
					session.refreshToken = token.refreshToken
				}
				if (token.expiresAt && typeof token.expiresAt === 'number') {
					session.expiresAt = token.expiresAt
				}
			}
			return session
		},
		async jwt({ token, account, user }) {
			if (account && user && user.id) {
				token.id = user.id
				// 型安全性の向上：accountのプロパティの存在確認
				if (account.access_token) {
					token.accessToken = account.access_token
				}
				if (account.refresh_token) {
					token.refreshToken = account.refresh_token
				}
				if (account.expires_at) {
					token.expires_at = account.expires_at
				}
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
