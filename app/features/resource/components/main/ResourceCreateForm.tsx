'use client'

import {
	Button,
	Form,
	Input,
	Label,
	Link,
	TextField,
} from 'react-aria-components'
import IconGoogle from '@/app/components/elements/IconGoogle'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { addResource } from '@/app/lib/redux/features/resource/resourceSlice'
import { createResource } from '@/app/lib/redux/features/resource/resourceAPI'

interface ResourceCreateFormProps {
	sectionId: string
	onClose: () => void
}

interface FormInputs {
	url: string
	title: string
}

const ResourceCreateForm = ({
	sectionId,
	onClose,
}: ResourceCreateFormProps) => {
	const [activeTab, setActiveTab] = useState<'url' | 'drive'>('url')
	const dispatch = useAppDispatch()

	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isValid },
	} = useForm<FormInputs>({
		defaultValues: {
			url: '',
			title: '',
		},
	})

	const getFaviconUrl = async (url: string): Promise<string | null> => {
		try {
			const response = await fetch(
				`/api/favicon?url=${encodeURIComponent(url)}`,
			)
			if (!response.ok) return null
			const data = await response.json()

			// まず直接URLを試す
			try {
				const directResponse = await fetch(data.faviconUrl)
				if (directResponse.ok) {
					return data.faviconUrl
				}
			} catch (error) {
				console.warn('Direct favicon fetch failed, using fallback')
			}

			// 失敗した場合はGoogle S2を使用
			return data.fallbackUrl
		} catch (error) {
			console.error('Failed to fetch favicon:', error)
			return null
		}
	}

	const onSubmit = async (data: FormInputs) => {
		try {
			const faviconUrl = await getFaviconUrl(data.url)

			const newResource = await createResource({
				...data,
				sectionId,
				faviconUrl,
			})

			dispatch(addResource(newResource))
			onClose()
		} catch (error) {
			console.error('Failed to create resource:', error)
		}
	}

	return (
		<div className="flex w-full md:w-[600px] h-[468px]">
			<div
				className="hidden md:block min-w-[200px] bg-zinc-100"
				aria-label="Side Menu"
			>
				<div className="text-xl font-bold p-4 text-zinc-700">Add Resource</div>
				<Button
					className={`w-full text-muted-foreground p-2 flex items-center gap-2 outline-none ${
						activeTab === 'url' ? 'bg-zinc-200' : ''
					}`}
					onPress={() => setActiveTab('url')}
					aria-label="URL"
				>
					<Link className="w-[20px] h-[20px]" />
					<div>URL</div>
				</Button>
				<Button
					className={`w-full text-muted-foreground p-2 flex items-center gap-1 outline-none ${
						activeTab === 'drive' ? 'bg-zinc-200' : ''
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
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											type="url"
											className="w-full p-2 border rounded mt-1 focus:outline-blue-500"
											placeholder="https://example.com"
											aria-label="URL"
										/>
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
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											type="text"
											className="w-full p-2 border-gray-200 rounded border focus:outline-blue-500"
											placeholder="Name"
											aria-label="Name"
										/>
									)}
								/>
							</TextField>
						</div>
						<div className="flex justify-between">
							<Button
								type="button"
								onPress={onClose}
								className="px-4 py-2 text-sm border rounded hover:bg-gray-200 focus:outline-blue-500"
							>
								キャンセル
							</Button>
							<Button
								type="submit"
								isDisabled={isSubmitting || !isValid}
								className="px-4 py-2 text-sm border rounded bg-blue-500 disabled:opacity-50 text-white hover:bg-blue-600 focus:outline-blue-500"
							>
								{isSubmitting ? '作成中...' : 'ADD RESOURCE'}
							</Button>
						</div>
					</div>
				</Form>
			)}
		</div>
	)
}

export default ResourceCreateForm