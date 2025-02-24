'use client'

import { useState, useRef, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import {
	resourceSchema,
	type ResourceFormData,
} from '../../schemas/resourceSchema'
import {
	Button,
	Form,
	Input,
	Label,
	Link,
	TextField,
} from 'react-aria-components'
import IconGoogle from '@/app/components/elements/IconGoogle'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import {
	addResource,
	removeResource,
} from '@/app/lib/redux/features/resource/resourceSlice'
import { createResource } from '@/app/lib/redux/features/resource/resourceAPI'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import GoogleDriveList from '@/app/features/google-drive/components/main/GoogleDriveList'
interface ResourceCreateFormProps {
	sectionId: string
	onClose: (isSubmit?: boolean) => void
}

const ResourceCreateForm = ({
	sectionId,
	onClose,
}: ResourceCreateFormProps) => {
	const [activeTab, setActiveTab] = useState<'url' | 'drive'>('url')
	const urlInputRef = useRef<HTMLInputElement>(null)
	const dispatch = useAppDispatch()

	const lastOrder = useAppSelector((state) => {
		const sectionResources = state.resource.resources.filter(
			(r) => r.sectionId === sectionId,
		)
		return sectionResources.length > 0
			? Math.max(...sectionResources.map((r) => r.order))
			: -1
	})

	useEffect(() => {
		if (activeTab === 'url') {
			urlInputRef.current?.focus()
		}
	}, [activeTab])

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<ResourceFormData>({
		resolver: zodResolver(resourceSchema),
		defaultValues: {
			url: '',
			title: '',
		},
		mode: 'onChange',
	})

	const getFaviconUrl = async (url: string): Promise<string | null> => {
		try {
			const response = await fetch(
				`/api/favicon?url=${encodeURIComponent(url)}`,
			)
			if (!response.ok) return null
			const data = await response.json()
			return data.faviconUrl
		} catch (error) {
			console.error('Failed to fetch favicon:', error)
			return null
		}
	}

	const onSubmit = async (data: ResourceFormData) => {
		try {
			const faviconUrl = await getFaviconUrl(data.url)
			const title = data.title?.trim() || new URL(data.url).hostname

			const optimisticResource: Resource = {
				id: `temp-${Date.now()}`,
				title,
				url: data.url,
				faviconUrl,
				description: null,
				sectionId,
				userId: '',
				order: lastOrder + 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			onClose(true)

			dispatch(addResource(optimisticResource))

			const newResource = await createResource({
				...data,
				title,
				sectionId,
				faviconUrl,
			})

			dispatch(removeResource(optimisticResource.id))
			dispatch(addResource(newResource))
		} catch (error) {
			console.error('Failed to create resource:', error)
			dispatch(removeResource(`temp-${Date.now()}`))
		}
	}

	return (
		<div className="flex w-full md:w-[600px] h-[468px]">
			<div
				className="hidden md:block min-w-[200px] bg-slate-100"
				aria-label="Side Menu"
			>
				<div className="text-xl font-bold p-4 text-slate-700">Add Resource</div>
				<Button
					className={`w-full text-muted-foreground p-2 flex items-center gap-2 outline-hidden ${
						activeTab === 'url' ? 'bg-slate-200' : ''
					}`}
					onPress={() => setActiveTab('url')}
					aria-label="URL"
				>
					<Link className="w-[20px] h-[20px]" />
					<div>URL</div>
				</Button>
				<Button
					className={`w-full text-muted-foreground p-2 flex items-center gap-1 outline-hidden ${
						activeTab === 'drive' ? 'bg-slate-200' : ''
					}`}
					onPress={() => setActiveTab('drive')}
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
									render={({ field }) => (
										<div>
											<Input
												{...field}
												ref={urlInputRef}
												type="url"
												className={`w-full p-2 border rounded mt-1 focus:outline-blue-500 
													${errors.url ? 'border-red-500' : 'border-gray-200'}`}
												placeholder="https://example.com"
												aria-label="URL"
											/>
											{errors.url && (
												<span className="text-red-500 text-sm mt-1">
													{errors.url.message}
												</span>
											)}
										</div>
									)}
								/>
							</TextField>
						</div>
						<div className="">
							<TextField>
								<Label className="text-sm">Name</Label>
								<Controller
									name="title"
									control={control}
									render={({ field }) => (
										<div>
											<Input
												{...field}
												type="text"
												className={`w-full p-2 border rounded mt-1 focus:outline-blue-500
													${errors.title ? 'border-red-500' : 'border-gray-200'}`}
												placeholder="Name"
												aria-label="Name"
											/>
											{errors.title && (
												<span className="text-red-500 text-sm mt-1">
													{errors.title.message}
												</span>
											)}
										</div>
									)}
								/>
							</TextField>
						</div>
						<div className="flex justify-between">
							<Button
								type="button"
								onPress={() => onClose(false)}
								className="px-4 py-2 text-sm border rounded-sm hover:bg-gray-50 outline-hidden"
							>
								キャンセル
							</Button>
							<Button
								type="submit"
								isDisabled={isSubmitting || !isValid}
								className={`px-4 py-2 text-sm border rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-blue-500
									${isSubmitting || !isValid ? 'opacity-50' : ''}`}
							>
								{isSubmitting ? '作成中...' : 'ADD RESOURCE'}
							</Button>
						</div>
					</div>
				</Form>
			)}
			{activeTab === 'drive' && (
				<GoogleDriveList
					sectionId={sectionId}
					onClose={onClose}
					lastOrder={lastOrder}
				/>
			)}
		</div>
	)
}

export default ResourceCreateForm
