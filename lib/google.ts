import { google } from 'googleapis'
import { auth } from '@/lib/auth'

export async function getGoogleAuth() {
	const session = await auth()
	if (!session?.accessToken) {
		throw new Error('アクセストークンが見つかりません')
	}

	const oauth2Client = new google.auth.OAuth2(
		process.env.AUTH_GOOGLE_ID,
		process.env.AUTH_GOOGLE_SECRET,
	)

	oauth2Client.setCredentials({
		access_token: session.accessToken,
		refresh_token: session.refreshToken,
		expiry_date: session.expiresAt ? session.expiresAt * 1000 : undefined,
	})

	oauth2Client.on('tokens', async (tokens) => {
		if (tokens.access_token) {
			console.log('Token refreshed')
		}
	})

	return oauth2Client
}
