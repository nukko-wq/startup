import { NextResponse } from 'next/server'

export async function GET() {
	try {
		// chrome APIはクライアントサイドでのみ利用可能なので、
		// サーバーサイドでの直接的な問い合わせは削除
		return NextResponse.json(
			{ message: 'Extension ID should be retrieved from client side' },
			{ status: 200 },
		)
	} catch (error) {
		return NextResponse.json(
			{ error: '拡張機能IDの取得に失敗しました' },
			{ status: 500 },
		)
	}
}
