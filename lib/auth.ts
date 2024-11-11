import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			email: string
			name: string
		}
		accessToken?: string
		refreshToken?: string
		expiresAt?: number
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		name?: string | null
		email?: string | null
		picture?: string | null
		accessToken?: string
		refreshToken?: string
		expiresAt?: number
	}
}

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
		maxAge: 30 * 24 * 60 * 60, // 30日
	},
	pages: {
		signIn: '/login',
		error: '/login',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			if (!allowedEmails.includes(user.email ?? '')) {
				return false
			}

			try {
				const existingUser = await db.user.findUnique({
					where: { email: user.email ?? '' },
				})

				if (!existingUser) {
					// トランザクションでユーザーとデフォルトワークスペースを作成
					await db.$transaction(async (tx) => {
						const newUser = await tx.user.create({
							data: {
								email: user.email ?? '',
								name: user.name,
								accounts: {
									create: {
										type: account?.type ?? 'oauth',
										provider: 'google',
										providerAccountId: account?.providerAccountId ?? '',
										access_token: account?.access_token,
										token_type: account?.token_type,
										refresh_token: account?.refresh_token,
										expires_at: account?.expires_at,
										scope: account?.scope,
										id_token: account?.id_token,
									},
								},
							},
						})

						// デフォルトワークスペースを作成
						await tx.workspace.create({
							data: {
								name: 'Default',
								userId: newUser.id,
								isDefault: true,
								order: 0,
							},
						})
					})
				}

				return true
			} catch (error) {
				console.error('Error in signIn callback:', error)
				return false
			}
		},
		async session({ session, token }) {
			if (session.user && token) {
				if (!token.id) {
					throw new Error('Token ID is missing')
				}

				session.user.id = token.id
				session.user.email = token.email ?? ''
				session.user.name = token.name ?? ''
				session.accessToken = token.accessToken
				session.refreshToken = token.refreshToken
				session.expiresAt = token.expiresAt
			}
			return session
		},
		async jwt({ token, account, user }) {
			if (account && user) {
				if (!user.id) {
					throw new Error('User ID is missing')
				}

				token.id = user.id
				token.accessToken = account.access_token
				token.refreshToken = account.refresh_token
				token.expiresAt = account.expires_at
			}
			return token
		},
	},
	secret: process.env.AUTH_SECRET,
})
