// Google Drive APIのリクエストを行うための関数

import type { FetchGoogleDriveFilesResponse } from './types/googleDrive'

export const fetchGoogleDriveFiles = async (
	query?: string,
	limit = 30, // デフォルト値を30に設定
): Promise<FetchGoogleDriveFilesResponse> => {
	try {
		const params = new URLSearchParams()
		if (query) params.append('q', query)
		params.append('limit', limit.toString())

		const url = `/api/googleapis?${params.toString()}`
		const response = await fetch(url)
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'ファイルの取得に失敗しました')
		}

		return await response.json()
	} catch (error) {
		throw error instanceof Error
			? error
			: new Error('予期せぬエラーが発生しました')
	}
}
