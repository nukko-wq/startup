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
