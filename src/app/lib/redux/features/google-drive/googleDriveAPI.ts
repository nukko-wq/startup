// Google Drive APIのリクエストを行うための関数

import { signIn } from 'next-auth/react'
import type {
	ApiErrorResponse,
	FetchGoogleDriveFilesResponse,
	RecoverableErrorCode,
} from './types/googleDrive'
import { RECOVERABLE_ERROR_CODES } from './types/googleDrive'

interface FetchOptions {
	maxRetries?: number
	isRetry?: boolean
}

export const fetchGoogleDriveFiles = async (
	query?: string,
	limit = 30, // デフォルト値を30に設定
	options: FetchOptions = {},
): Promise<FetchGoogleDriveFilesResponse> => {
	const { maxRetries = 1, isRetry = false } = options

	try {
		const params = new URLSearchParams()
		if (query) params.append('q', query)
		params.append('limit', limit.toString())

		const url = `/api/googleapis?${params.toString()}`
		const response = await fetch(url)

		if (!response.ok) {
			const errorResponse: ApiErrorResponse = await response.json()

			// 401エラー（認証エラー）の場合の自動リトライ処理
			if (response.status === 401 && !isRetry && maxRetries > 0) {
				// 復旧可能なエラーかチェック
				if (
					RECOVERABLE_ERROR_CODES.includes(
						errorResponse.code as RecoverableErrorCode,
					)
				) {
					// 自動再認証を試行
					try {
						const result = await signIn('google', {
							redirect: false,
							callbackUrl: window.location.href,
						})

						if (result?.ok) {
							// 認証成功後にリトライ
							return await fetchGoogleDriveFiles(query, limit, {
								maxRetries: maxRetries - 1,
								isRetry: true,
							})
						}
					} catch (authError) {
						console.error('自動認証に失敗しました:', authError)
					}
				}
			}

			throw new Error(errorResponse.error || 'ファイルの取得に失敗しました')
		}

		return await response.json()
	} catch (error) {
		throw error instanceof Error
			? error
			: new Error('予期せぬエラーが発生しました')
	}
}
