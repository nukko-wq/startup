import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Button, Input } from 'react-aria-components'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import {
	setLoading,
	setFiles,
	setError,
} from '@/app/lib/redux/features/google-drive/googleDriveSlice'
import { fetchGoogleDriveFiles } from '@/app/lib/redux/features/google-drive/googleDriveAPI'
import GoogleDriveListIcon from '@/app/features/google-drive/components/GoogleDriveListIcon'
import type { GoogleDriveFile } from '@/app/lib/redux/features/google-drive/types/googleDrive'
import {
	addResource,
	removeResource,
} from '@/app/lib/redux/features/resource/resourceSlice'
import { createResource } from '@/app/lib/redux/features/resource/resourceAPI'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import debounce from 'lodash/debounce'
import { signOut } from 'next-auth/react'

interface GoogleDriveListProps {
	sectionId: string
	onClose: (isSubmit?: boolean) => void
	lastOrder: number
}

const GoogleDriveList = ({
	sectionId,
	onClose,
	lastOrder,
}: GoogleDriveListProps) => {
	const [searchQuery, setSearchQuery] = useState('')
	const dispatch = useAppDispatch()
	const { files, loading, error } = useAppSelector((state) => state.googleDrive)
	const [fileCache, setFileCache] = useState<Record<string, GoogleDriveFile[]>>(
		{},
	)

	const DEBOUNCE_DELAY = 500
	const debouncedFetchFiles = useMemo(
		() => debounce((query: string) => fetchFiles(query), DEBOUNCE_DELAY),
		[],
	)

	const SEARCH_LIMIT = 20 // 検索時の制限
	const DEFAULT_LIMIT = 30 // 初期表示時の制限

	const fetchFiles = async (query?: string) => {
		const limit = query ? SEARCH_LIMIT : DEFAULT_LIMIT

		const cacheKey = query || ''

		if (fileCache[cacheKey]) {
			dispatch(setFiles(fileCache[cacheKey]))
			return
		}

		dispatch(setLoading(true))
		try {
			const response = await fetchGoogleDriveFiles(query, limit)
			setFileCache((prev) => ({
				...prev,
				[cacheKey]: response.files,
			}))
			dispatch(setFiles(response.files))
		} catch (error) {
			if (error instanceof Error) {
				if (
					error.message === '再認証が必要です' ||
					error.message === 'トークンの更新に失敗しました'
				) {
					// ユーザーに再ログインを促す
					dispatch(
						setError(
							'セッションの有効期限が切れました。再度ログインしてください。',
						),
					)
					signOut() // NextAuthのsignOut関数を呼び出し
				} else {
					dispatch(setError(error.message))
				}
			}
		} finally {
			dispatch(setLoading(false))
		}
	}

	// 初回読み込み時のみ実行
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchFiles()
	}, [])

	// 検索クエリが変更された時のみ実行
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!searchQuery) {
			fetchFiles()
			return
		}

		debouncedFetchFiles(searchQuery)
		return () => debouncedFetchFiles.cancel()
	}, [searchQuery, debouncedFetchFiles])

	const handleFileSelect = async (file: GoogleDriveFile) => {
		try {
			const optimisticResource: Resource = {
				id: `temp-${Date.now()}`,
				title: file.name,
				url: file.webViewLink,
				faviconUrl: '',
				description: null,
				sectionId,
				userId: '',
				order: lastOrder + 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			dispatch(addResource(optimisticResource))
			onClose(true)

			const newResource = await createResource({
				title: file.name,
				url: file.webViewLink,
				sectionId,
				faviconUrl: '',
			})

			dispatch(removeResource(optimisticResource.id))
			dispatch(addResource(newResource))
		} catch (error) {
			console.error('Googleドライブファイルの追加に失敗しました:', error)
			dispatch(removeResource(`temp-${Date.now()}`))
		}
	}

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-center py-2">
				<Search className="w-[20px] h-[20px] text-slate-700 ml-4 mr-2" />
				<Input
					className="w-[400px] text-slate-700 outline-hidden"
					placeholder="Search Drive for resources to add..."
					aria-label="Search Drive"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>
			<div
				className="flex flex-col grow w-[400px] h-[428px] border-l"
				aria-label="Recent Google Drive Files"
			>
				<div className="flex items-center justify-center h-[17px]">
					<div className="border-t border-slate-200 grow" />
					{!searchQuery && (
						<h2 className="text-sm text-slate-500 px-4">Recent</h2>
					)}
					<div className="border-t border-slate-200 grow" />
				</div>
				{loading ? (
					<div className="flex grow items-center justify-center">
						<div className="text-slate-700">読み込み中...</div>
					</div>
				) : error ? (
					<div className="p-4 text-center text-red-500">{error}</div>
				) : (
					<div className="overflow-y-auto overflow-x-hidden">
						<ul className="flex flex-col">
							{files.map((file) => (
								<li
									key={file.id}
									className="h-[40px] flex items-center hover:bg-slate-100 cursor-pointer group/item"
								>
									<Button
										onPress={() => handleFileSelect(file)}
										className="w-full p-2 outline-hidden"
									>
										<div className="flex items-center gap-2">
											<GoogleDriveListIcon mimeType={file.mimeType} />
											<span className="truncate text-sm">{file.name}</span>
										</div>
									</Button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	)
}

export default GoogleDriveList
