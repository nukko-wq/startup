import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
	try {
		const session = await auth()

		if (!session?.accessToken) {
			return NextResponse.json(
				{ error: 'アクセストークンが見つかりません' },
				{ status: 401 },
			)
		}

		const oauth2Client = new google.auth.OAuth2(
			process.env.AUTH_GOOGLE_ID,
			process.env.AUTH_GOOGLE_SECRET,
		)

		oauth2Client.setCredentials({
			access_token: session.accessToken,
			// refresh_tokenも設定できる場合は追加
		})

		const drive = google.drive({ version: 'v3', auth: oauth2Client })
		const response = await drive.files.list({
			pageSize: 10,
			orderBy: 'viewedByMeTime desc',
			fields: 'files(id, name, webViewLink)',
			q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
		})

		return NextResponse.json({ files: response.data.files || [] })
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
