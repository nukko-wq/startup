import { NextResponse } from 'next/server'

export async function GET() {
	try {
		// 拡張機能のIDを環境変数から取得
		const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID

		if (!extensionId) {
			// 拡張機能がインストールされていない場合の処理
			return NextResponse.json(
				{ error: '拡張機能がインストールされていません' },
				{ status: 404 },
			)
		}

		return NextResponse.json({ extensionId })
	} catch (error) {
		return NextResponse.json(
			{ error: '拡張機能IDの取得に失敗しました' },
			{ status: 500 },
		)
	}
}
