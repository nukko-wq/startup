// Google Drive APIの認証を行うための関数

import { google } from 'googleapis'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function getGoogleAuth(session: Session | null) {
	if (!session?.user?.id) {
		throw new Error('ユーザーが見つかりません')
	}

	const oauth2Client = new google.auth.OAuth2(
		process.env.AUTH_GOOGLE_ID,
		process.env.AUTH_GOOGLE_SECRET,
		process.env.NEXTAUTH_URL,
	)

	try {
		const account = await prisma.account.findFirst({
			where: {
				provider: 'google',
				userId: session.user.id,
			},
		})

		if (!account) {
			throw new Error('Googleアカウントが見つかりません')
		}

		if (!account.refresh_token) {
			throw new Error('再認証が必要です')
		}

		oauth2Client.setCredentials({
			access_token: account.access_token,
			refresh_token: account.refresh_token,
			expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
		})

		if (!account.expires_at || account.expires_at * 1000 < Date.now()) {
			try {
				const { credentials } = await oauth2Client.refreshAccessToken()

				await prisma.account.update({
					where: {
						provider_providerAccountId: {
							provider: 'google',
							providerAccountId: account.providerAccountId,
						},
					},
					data: {
						access_token: credentials.access_token,
						expires_at: Math.floor((credentials.expiry_date as number) / 1000),
						refresh_token: credentials.refresh_token || account.refresh_token,
					},
				})

				oauth2Client.setCredentials(credentials)
			} catch (refreshError) {
				console.error('トークン更新エラー:', refreshError)
				throw new Error('トークンの更新に失敗しました')
			}
		}

		return oauth2Client
	} catch (error) {
		console.error('Google Auth Error:', error)
		if (
			error instanceof Error &&
			error.message === 'トークンの更新に失敗しました'
		) {
			throw error
		}
		throw new Error('Google認証に失敗しました')
	}
}
