import { NextResponse } from 'next/server'

export async function GET() {
	try {
		// 環境変数から拡張機能IDを取得
		let extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID

		if (!extensionId) {
			// 拡張機能に直接問い合わせを試みる
			try {
				const response = await chrome.runtime.sendMessage(undefined, {
					type: 'GET_EXTENSION_ID',
				})
				if (response?.success && response.extensionId) {
					extensionId = response.extensionId
				}
			} catch (error) {
				console.error('拡張機能との通信に失敗:', error)
			}
		}

		if (!extensionId) {
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
