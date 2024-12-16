import { useState, useEffect } from 'react'
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

const GoogleDriveList = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const dispatch = useAppDispatch()
	const { files, loading, error } = useAppSelector((state) => state.googleDrive)

	const fetchFiles = async (query?: string) => {
		dispatch(setLoading(true))
		try {
			const response = await fetchGoogleDriveFiles(query)
			dispatch(setFiles(response.files))
		} catch (error) {
			dispatch(
				setError(
					error instanceof Error
						? error.message
						: '予期せぬエラーが発生しました',
				),
			)
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
		if (!searchQuery) return // 検索クエリが空の場合は実行しない

		const timer = setTimeout(() => {
			fetchFiles(searchQuery)
		}, 500)

		return () => clearTimeout(timer)
	}, [searchQuery])

	const handleFileSelect = (file: GoogleDriveFile) => {
		// ファイル選択時の処理をここに実装
	}

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-center py-2">
				<Search className="w-[20px] h-[20px] text-zinc-700 ml-4 mr-2" />
				<Input
					className="w-[400px] text-zinc-700 outline-none"
					placeholder="Search Drive for resources to add..."
					aria-label="Search Drive"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>
			<div
				className="flex flex-col flex-grow w-[400px] h-[428px] border-l"
				aria-label="Recent Google Drive Files"
			>
				<div className="flex items-center justify-center h-[17px]">
					<div className="border-t border-zinc-200 flex-grow" />
					{!searchQuery && (
						<h2 className="text-sm text-zinc-500 px-4">Recent</h2>
					)}
					<div className="border-t border-zinc-200 flex-grow" />
				</div>
				{loading ? (
					<div className="flex flex-grow items-center justify-center">
						<div className="text-zinc-700">読み込み中...</div>
					</div>
				) : error ? (
					<div className="p-4 text-center text-red-500">{error}</div>
				) : (
					<div className="overflow-y-auto overflow-x-hidden">
						<ul className="flex flex-col">
							{files.map((file) => (
								<li
									key={file.id}
									className="h-[40px] flex items-center hover:bg-zinc-100 cursor-pointer group/item"
								>
									<Button
										onPress={() => handleFileSelect(file)}
										className="w-full p-2 outline-none"
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
