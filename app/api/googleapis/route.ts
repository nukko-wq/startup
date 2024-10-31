import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
	try {
		const session = await auth()
		const accessToken = session?.accessToken

		if (!accessToken) {
			console.log('No access token found in session:', session)
			return NextResponse.json(
				{ error: 'アクセストークンが見つかりません' },
				{ status: 401 },
			)
		}

		const oauth2Client = new google.auth.OAuth2(
			process.env.AUTH_GOOGLE_ID,
			process.env.AUTH_GOOGLE_SECRET,
			process.env.NEXTAUTH_URL,
		)

		oauth2Client.setCredentials({
			access_token: accessToken,
			scope: 'https://www.googleapis.com/auth/drive.readonly',
		})

		const drive = google.drive({ version: 'v3', auth: oauth2Client })
		const response = await drive.files.list({
			pageSize: 10,
			orderBy: 'viewedByMeTime desc',
			fields: 'files(id, name, webViewLink, mimeType)',
			q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
		})

		if (!response.data.files) {
			console.log('No files found in response:', response.data)
			return NextResponse.json({ files: [] })
		}

		return NextResponse.json({ files: response.data.files })
	} catch (error) {
		console.error('Google Drive API error:', error)
		return NextResponse.json(
			{
				error: 'Google Driveファイルの取得に失敗しました',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}
