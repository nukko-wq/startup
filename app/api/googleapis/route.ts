import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGoogleAuth } from '@/lib/google'

// Google APIのエラー型を定義
interface GoogleApiError extends Error {
	code?: number
	status?: number
	message: string
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const query = searchParams.get('q') || ''

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

			const searchQuery = query
				? `name contains '${query}' and mimeType != 'application/vnd.google-apps.folder' and trashed = false`
				: "mimeType != 'application/vnd.google-apps.folder' and trashed = false"

			// 検索時は100件、デフォルト表示時は10件を取得
			const pageSize = query ? 100 : 10

			const response = await drive.files.list({
				pageSize,
				orderBy: 'viewedByMeTime desc',
				fields: 'files(id, name, webViewLink, mimeType)',
				q: searchQuery,
			})

			return NextResponse.json({ files: response.data.files || [] })
		} catch (error) {
			console.error('Google Drive API error:', error)
			const apiError = error as GoogleApiError

			if (apiError.message === 'アクセストークンが見つかりません') {
				return NextResponse.json(
					{ error: 'Google認証が必要です。再度ログインしてください。' },
					{ status: 401 },
				)
			}

			if (apiError.code === 401 || apiError.status === 401) {
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
