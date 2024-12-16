import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGoogleAuth } from '@/lib/google'
import type { GoogleDriveApiError } from '@/app/lib/redux/features/google-drive/types/googleDrive'

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const query = searchParams.get('q') || ''
		const limit = Number.parseInt(searchParams.get('limit') || '20', 10)

		const session = await auth()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
		}

		try {
			const auth = await getGoogleAuth(session)
			const drive = google.drive({ version: 'v3', auth })

			const searchQuery = query
				? `name contains '${query}' and mimeType != 'application/vnd.google-apps.folder' and trashed = false`
				: "mimeType != 'application/vnd.google-apps.folder' and trashed = false"

			const response = await drive.files.list({
				pageSize: limit,
				orderBy: 'viewedByMeTime desc',
				fields: 'files(id, name, webViewLink, mimeType)',
				q: searchQuery,
				spaces: 'drive',
			})

			return NextResponse.json({ files: response.data.files || [] })
		} catch (error) {
			console.error('Google Drive API error:', error)
			const apiError = error as GoogleDriveApiError

			if (apiError.message === 'トークンの更新に失敗しました') {
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
