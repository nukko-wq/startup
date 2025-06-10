// Google Drive APIの型定義

export interface GoogleDriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
}

export interface GoogleDriveState {
	files: GoogleDriveFile[]
	loading: boolean
	error: string | null
}

export interface FetchGoogleDriveFilesResponse {
	files: GoogleDriveFile[]
	error?: string
}

export interface GoogleDriveApiError {
	code?: number
	status?: number
	message: string
	errors?: Array<{ message: string }>
}

export interface ApiErrorResponse {
	error: string
	code:
		| 'UNAUTHORIZED'
		| 'TOKEN_REFRESH_FAILED'
		| 'REAUTH_REQUIRED'
		| 'ACCOUNT_NOT_FOUND'
		| 'DRIVE_ACCESS_ERROR'
		| 'SERVER_ERROR'
}

// 自動復旧可能なエラーコード
export const RECOVERABLE_ERROR_CODES = [
	'TOKEN_REFRESH_FAILED',
	'REAUTH_REQUIRED',
] as const

export type RecoverableErrorCode = (typeof RECOVERABLE_ERROR_CODES)[number]
