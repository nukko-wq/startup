import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGoogleAuth } from '@/lib/google'

export async function GET() {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
		}

		if (!session.accessToken) {
			return NextResponse.json(
				{ error: 'Google認証が必要です' },
				{ status: 401 },
			)
		}

		try {
			const auth = await getGoogleAuth()
			const drive = google.drive({ version: 'v3', auth })

			const response = await drive.files.list({
				pageSize: 10,
				orderBy: 'viewedByMeTime desc',
				fields: 'files(id, name, webViewLink, mimeType)',
				q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
			})

			return NextResponse.json({ files: response.data.files || [] })
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			console.error('Google Drive API error:', error)

			if (error.message === 'アクセストークンが見つかりません') {
				return NextResponse.json(
					{ error: 'Google認証が必要です。再度ログインしてください。' },
					{ status: 401 },
				)
			}

			if (error.code === 401 || error.status === 401) {
				return NextResponse.json(
					{ error: '認証の有効期限が切れました。再度ログインしてください。' },
					{ status: 401 },
				)
			}

			return NextResponse.json(
				{ error: 'Google Driveへのアクセスに失敗しました' },
				{ status: 500 },
			)
		}
	} catch (error) {
		console.error('Server error:', error)
		return NextResponse.json(
			{ error: 'サーバーエラーが発生しました' },
			{ status: 500 },
		)
	}
}
