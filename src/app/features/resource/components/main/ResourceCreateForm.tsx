'use client'

import IconGoogle from '@/app/components/elements/IconGoogle'
import GoogleDriveList from '@/app/features/google-drive/components/main/GoogleDriveList'
import { createResource } from '@/app/lib/redux/features/resource/resourceAPI'
import {
	addResource,
	removeResource,
} from '@/app/lib/redux/features/resource/resourceSlice'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import {
	type ResourceFormData,
	resourceSchema,
} from '../../schemas/resourceSchema'
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
		<div className="flex h-[468px] w-full md:w-[600px]">
			<div
				className="hidden min-w-[200px] bg-slate-100 md:block"
				aria-label="Side Menu"
			>
				<div className="p-4 font-bold text-slate-700 text-xl">Startup</div>
				<Button
					className={`flex w-full cursor-pointer items-center gap-2 p-2 text-muted-foreground outline-hidden ${
						activeTab === 'url' ? 'bg-slate-200' : ''
					}`}
					onPress={() => setActiveTab('url')}
					aria-label="URL"
				>
					<Link className="h-[20px] w-[20px]" />
					<div>URL</div>
				</Button>
				<Button
					className={`flex w-full cursor-pointer items-center gap-1 p-2 text-muted-foreground outline-hidden ${
						activeTab === 'drive' ? 'bg-slate-200' : ''
					}`}
					onPress={() => setActiveTab('drive')}
					aria-label="Google Drive"
				>
					<div className="flex items-center gap-2">
						<IconGoogle variant="drive" className="h-[20px] w-[20px]" />
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
					<div className="flex w-[400px] flex-col space-y-4 p-9">
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
												className={`mt-1 w-full rounded border p-2 focus:outline-blue-500 ${errors.url ? 'border-red-500' : 'border-gray-200'}`}
												placeholder="https://example.com"
												aria-label="URL"
											/>
											{errors.url && (
												<span className="mt-1 text-red-500 text-sm">
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
												className={`mt-1 w-full rounded border p-2 focus:outline-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
												placeholder="Name"
												aria-label="Name"
											/>
											{errors.title && (
												<span className="mt-1 text-red-500 text-sm">
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
								className="cursor-pointer rounded-sm border px-4 py-2 text-sm outline-hidden hover:bg-gray-50"
							>
								キャンセル
							</Button>
							<Button
								type="submit"
								isDisabled={isSubmitting || !isValid}
								className={`cursor-pointer rounded border bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 focus:outline-blue-500 ${isSubmitting || !isValid ? 'opacity-50' : ''}`}
							>
								{isSubmitting ? '作成中...' : 'リソースを追加'}
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
