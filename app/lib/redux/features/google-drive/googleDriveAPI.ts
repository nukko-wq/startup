// Google Drive APIのリクエストを行うための関数

import type { FetchGoogleDriveFilesResponse } from './types/googleDrive'

export const fetchGoogleDriveFiles = async (
	query?: string,
): Promise<FetchGoogleDriveFilesResponse> => {
	try {
		const url = query
			? `/api/googleapis?q=${encodeURIComponent(query)}`
			: '/api/googleapis'

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
