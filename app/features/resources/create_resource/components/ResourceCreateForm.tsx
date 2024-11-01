'use client'

import { resourceSchema, type ResourceSchema } from '@/lib/validations/resource'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	Button,
	Form,
	Input,
	Label,
	TextField,
	Text,
} from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'lucide-react'
import { useResources } from '@/app/features/resources/contexts/ResourceContext'
import { useSession } from 'next-auth/react'
import IconGoogle from '@/app/components/elements/IconGoogle'
import { useCallback } from 'react'

interface ResourceCreateFormProps {
	onClose: () => void
}

interface DriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
}

const ResourceCreateForm = ({ onClose }: ResourceCreateFormProps) => {
	const urlInputRef = useRef<HTMLInputElement | null>(null)
	const [urlPlaceholder, setUrlPlaceholder] = useState('URL')
	const { resources, addResource, setResources, driveFiles, setDriveFiles } =
		useResources()
	const [isLoadingFiles, setIsLoadingFiles] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const { data: session } = useSession()
	const [activeTab, setActiveTab] = useState<'url' | 'drive'>('url')

	// Google Drive のファイル一覧を取得
	const fetchDriveFiles = useCallback(async () => {
		if (!session) {
			setError('セッションが見つかりません')
			return
		}

		if (driveFiles.length > 0) return
		setIsLoadingFiles(true)
		setError(null)

		try {
			const response = await fetch('/api/googleapis')
			if (!response.ok) {
				throw new Error('ファイルの取得に失敗しました')
			}
			const data = await response.json()
			setDriveFiles(data.files || [])
		} catch (error) {
			console.error('Error fetching Google Drive files:', error)
			setError(error instanceof Error ? error.message : 'エラーが発生しました')
		} finally {
			setIsLoadingFiles(false)
		}
	}, [session, driveFiles.length, setDriveFiles])

	// タブ切り替え時にプリフェッチ
	const handleDriveTabHover = useCallback(() => {
		if (driveFiles.length === 0 && !isLoadingFiles) {
			fetchDriveFiles()
		}
	}, [driveFiles.length, isLoadingFiles, fetchDriveFiles])

	useEffect(() => {
		// URLタブがアクティブなときにバックグラウンドでファイルを取得
		if (activeTab === 'url') {
			fetchDriveFiles()
		}
	}, [activeTab, fetchDriveFiles])

	const getFileIcon = (mimeType: string) => {
		switch (mimeType) {
			case 'application/vnd.google-apps.document':
				return <IconGoogle variant="docs" className="w-[20px] h-[20px]" />
			case 'application/vnd.google-apps.spreadsheet':
				return <IconGoogle variant="sheets" className="w-[20px] h-[20px]" />
			case 'application/vnd.google-apps.presentation':
				return <IconGoogle variant="slides" className="w-[20px] h-[20px]" />
			case 'application/vnd.google-apps.form':
				return <IconGoogle variant="forms" className="w-[20px] h-[20px]" />
			default:
				return <IconGoogle variant="drive" className="w-[20px] h-[20px]" />
		}
	}

	useEffect(() => {
		urlInputRef.current?.focus()
	}, [])

	useEffect(() => {
		const handleFocus = () => setUrlPlaceholder('https://google.com')
		const handleBlur = () => setUrlPlaceholder('URL')

		const inputElement = urlInputRef.current
		if (inputElement) {
			inputElement.focus()
			setUrlPlaceholder('https://google.com')
			inputElement.addEventListener('focus', handleFocus)
			inputElement.addEventListener('blur', handleBlur)
		}

		return () => {
			inputElement?.removeEventListener('focus', handleFocus)
			inputElement?.removeEventListener('blur', handleBlur)
		}
	}, [])

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting, isValid },
	} = useForm<ResourceSchema>({
		resolver: zodResolver(resourceSchema),
		mode: 'onChange',
	})

	const onSubmit = async (data: ResourceSchema) => {
		try {
			const faviconResponse = await fetch(
				`/api/favicon?url=${encodeURIComponent(data.url)}`,
			)
			const faviconData = await faviconResponse.json()

			const submissionData = {
				...data,
				title: data.title || data.url,
				faviconUrl: faviconData.faviconUrl,
				position: resources.length + 1,
				description: data.description || '',
				mimeType: data.mimeType || '',
				isGoogleDrive: data.isGoogleDrive || false,
			}

			// Optimistic Update
			const tempId = `temp-${Date.now()}`
			const optimisticResource = {
				...submissionData,
				id: tempId,
			}
			await addResource(optimisticResource)

			// APリクエストを実行
			const response = await fetch('/api/resources', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(submissionData),
			})

			if (!response.ok) {
				throw new Error('Failed to create resource')
			}

			// 成功時は実際のIDで更新
			const newResource = await response.json()
			setResources((prev) =>
				prev.map((resource) =>
					resource.id === tempId
						? {
								...resource,
								id: newResource.id,
							}
						: resource,
				),
			)
			onClose()
		} catch (err) {
			console.error('Resource creation error:', error)
			setError(err instanceof Error ? err.message : 'エラーが発生しました')

			// エラー時はリソースを削除
			addResource((prev) =>
				prev.filter((resource) => resource.id !== `temp-${Date.now()}`),
			)
			alert('リソースの作成に失敗しました')
		}
	}

	const handleUrlTabClick = () => {
		if (activeTab === 'url') return
		setActiveTab('url')
		setTimeout(() => {
			urlInputRef.current?.focus()
		}, 0)
	}

	// ファイルを選択したときの処理
	const handleDriveFileClick = async (file: DriveFile) => {
		try {
			let description = ''
			switch (file.mimeType) {
				case 'application/vnd.google-apps.document':
					description = 'Google Doc'
					break
				case 'application/vnd.google-apps.spreadsheet':
					description = 'Google Sheet'
					break
				case 'application/vnd.google-apps.form':
					description = 'Google Form'
					break
				case 'application/vnd.google-apps.presentation':
					description = 'Google Slide'
					break
			}

			const submissionData = {
				title: file.name,
				url: file.webViewLink,
				driveFileId: file.id,
				mimeType: file.mimeType,
				isGoogleDrive: true,
				position: resources.length + 1,
				description: description,
				faviconUrl: '',
			}

			// Optimistic Update
			const tempId = `temp-${Date.now()}`
			const optimisticResource = {
				...submissionData,
				id: tempId,
			}
			addResource(optimisticResource)

			// APIリクエストを実行
			const response = await fetch('/api/resources', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(submissionData),
			})

			if (!response.ok) {
				throw new Error('Failed to create resource')
			}

			// 成功時は実際のIDで更新
			const newResource = await response.json()
			setResources((prev) =>
				prev.map((resource) =>
					resource.id === tempId
						? { ...resource, id: newResource.id }
						: resource,
				),
			)
			onClose()
		} catch (error) {
			console.error('Resource creation error:', error)
			// エラー時はリソースを削除
			setResources((prev) =>
				prev.filter((resource) => resource.id !== `temp-${Date.now()}`),
			)
		}
	}

	return (
		<div className="flex w-[600px] h-[468px]">
			<div className="min-w-[200px] bg-zinc-100" aria-label="Side Menu">
				<div className="text-xl font-bold p-4 text-zinc-700">Add Resource</div>
				<Button
					className={`w-full text-muted-foreground p-2 flex items-center gap-2 outline-none ${
						activeTab === 'url' ? 'bg-foreground/10' : ''
					}`}
					onPress={handleUrlTabClick}
				>
					<Link className="w-[20px] h-[20px]" />
					<div>URL</div>
				</Button>
				<Button
					className={`w-full text-muted-foreground p-2 flex items-center gap-1 outline-none ${
						activeTab === 'drive' ? 'bg-foreground/10' : ''
					}`}
					onPress={() => setActiveTab('drive')}
					onHoverStart={handleDriveTabHover}
					aria-label="Google Drive"
				>
					<div className="flex items-center gap-2">
						<IconGoogle variant="drive" className="w-[20px] h-[20px]" />
						<div className="">Google Drive</div>
					</div>
				</Button>
			</div>
			{activeTab === 'url' && (
				<Form
					onSubmit={handleSubmit(onSubmit)}
					className=""
					aria-label="URL Form"
				>
					<div className="flex flex-col p-9 space-y-4 w-[400px]">
						<div className="">
							<TextField>
								<Label className="text-sm">URL</Label>
								<Controller
									name="url"
									control={control}
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											type="url"
											className="w-full p-2 border rounded mt-1 focus:outline-blue-500"
											placeholder={urlPlaceholder}
											aria-label="URL"
											ref={urlInputRef}
										/>
									)}
								/>
								{errors.url && (
									<Text slot="errorMessage" className="text-red-500 text-sm">
										{errors.url.message}
									</Text>
								)}
							</TextField>
						</div>
						<div className="">
							<TextField>
								<Label className="text-sm">Name</Label>
								<Controller
									name="title"
									control={control}
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
											type="text"
											className="w-full p-2 border-gray-200 rounded border focus:outline-blue-500"
											placeholder="Name"
											aria-label="Name"
										/>
									)}
								/>
								{errors.title && (
									<Text slot="errorMessage" className="text-red-500 text-sm">
										{errors.title.message}
									</Text>
								)}
							</TextField>
						</div>
						<div className="flex justify-between">
							<Button
								type="button"
								onPress={onClose}
								className="px-4 py-2 text-sm border rounded hover:bg-gray-200 focus:outline-blue-500"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								isDisabled={isSubmitting || !isValid}
								className="px-4 py-2 text-sm border rounded bg-blue-500 disabled:bg-gray-200 text-white disabled:text-gray-700 hover:bg-blue-600 disabled:opacity-60 focus:outline-blue-500"
							>
								{isSubmitting ? 'Saving...' : 'ADD RESOURCE'}
							</Button>
						</div>
					</div>
				</Form>
			)}
			{activeTab === 'drive' && (
				<div
					className="flex flex-col w-[400px] border-l"
					aria-label="Recent Google Drive Files"
				>
					<div className="flex items-center justify-center py-4">
						<h2 className="text-lg font-bold text-zinc-700">
							最近のGoogle Driveファイル
						</h2>
					</div>
					{isLoadingFiles ? (
						<div>読み込み中...</div>
					) : error ? (
						<div className="text-red-500">{error}</div>
					) : driveFiles.length === 0 ? (
						<div>ファイルが見つかりません</div>
					) : (
						<div className="overflow-y-auto">
							<ul className="flex flex-col">
								{driveFiles.map((file) => (
									// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
									<li
										key={file.id}
										className="h-[40px] flex items-center hover:bg-gray-100 rounded cursor-pointer"
										onClick={() => {
											if (urlInputRef.current) {
												urlInputRef.current.value = file.webViewLink
											}
											handleDriveFileClick(file)
										}}
									>
										<div className="flex items-center gap-2">
											<div className="pl-4">{getFileIcon(file.mimeType)}</div>
											<div
												className="text-ellipsis overflow-hidden whitespace-nowrap w-[355px] pr-6"
												aria-label="Google Drive File Name"
											>
												{file.name}
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default ResourceCreateForm
