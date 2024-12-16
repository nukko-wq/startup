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

	const DEBOUNCE_DELAY = 500
	const debouncedFetchFiles = useMemo(
		() => debounce((query: string) => fetchFiles(query), DEBOUNCE_DELAY),
		[],
	)

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
