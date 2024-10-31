'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resourceSchema, type ResourceSchema } from '@/lib/validations/resource'
import type { Resource } from '@prisma/client'
import {
	Form,
	TextField,
	Input,
	Label,
	Text,
	Button,
} from 'react-aria-components'
import { useEffect, useRef } from 'react'
import { Earth } from 'lucide-react'
import { useResources } from '@/app/features/resources/contexts/ResourceContext'

interface ResourceEditFormProps {
	resource: Pick<Resource, 'id' | 'title' | 'url' | 'description'>
	onClose: () => void
}

export default function ResourceEditForm({
	resource,
	onClose,
}: ResourceEditFormProps) {
	const titleInputRef = useRef<HTMLInputElement>(null)
	const { updateResource } = useResources()

	useEffect(() => {
		if (titleInputRef.current) {
			titleInputRef.current.focus()

			const length = titleInputRef.current.value.length
			titleInputRef.current.setSelectionRange(length, length)
		}
	}, [])

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<ResourceSchema>({
		resolver: zodResolver(resourceSchema),
		defaultValues: {
			title: resource.title,
			url: resource.url,
			description: resource.description || '',
		},
	})

	const onSubmit = async (data: ResourceSchema) => {
		try {
			// Optimistic Update
			const optimisticData = {
				...resource,
				title: data.title || resource.title,
				url: data.url,
				description: data.description || '',
			}

			// 更新に必要なフィールドのみ送信
			const updateData = {
				title: data.title,
				url: data.url,
				description: data.description,
			}

			await updateResource(resource.id, optimisticData)
			onClose()

			// APIリクエストを実行
			const response = await fetch(`/api/resources/${resource.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updateData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				if (response.status === 404) {
					throw new Error('Resource not found')
				}
				throw new Error(errorData.error || 'Failed to update resource')
			}
		} catch (err) {
			await updateResource(resource.id, resource)
			setError('root', {
				message:
					err instanceof Error ? err.message : 'Failed to update resource',
			})
		}
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow">
			<div className="flex items-center gap-2 border-b border-gray-200">
				<div className="border border-gray-200 rounded-sm ml-4 w-8 h-8 flex items-center justify-center">
					<Earth className="w-4 h-4 text-zinc-700" />
				</div>
				<Controller
					name="title"
					control={control}
					render={({ field: { value, onChange, onBlur } }) => (
						<Input
							value={value}
							onChange={onChange}
							onBlur={onBlur}
							type="text"
							className="w-full py-4 px-2 rounded-t-lg outline-none text-lg"
							aria-label="Name"
							ref={titleInputRef}
						/>
					)}
				/>
				{errors.title && (
					<p className="text-red-500 text-sm">{errors.title.message}</p>
				)}
			</div>
			<div className="flex flex-col px-[40px] py-[32px] gap-2">
				<div className="">
					<TextField>
						<Label className="text-sm">URL</Label>
						<Controller
							name="url"
							control={control}
							render={({ field: { value, onChange, onBlur, ref } }) => (
								<Input
									value={value}
									onChange={onChange}
									onBlur={onBlur}
									ref={ref}
									type="url"
									className="w-full p-2 border rounded mt-1 focus:outline-blue-500"
									aria-label="URL"
								/>
							)}
						/>
						{errors.url && (
							<Text className="text-red-500 text-sm">{errors.url.message}</Text>
						)}
					</TextField>
				</div>
				<div>
					<TextField>
						<Label className="text-sm">Description</Label>
						<Controller
							name="description"
							control={control}
							render={({ field: { value, onChange, onBlur, ref } }) => (
								<Input
									value={value}
									onChange={onChange}
									onBlur={onBlur}
									ref={ref}
									type="text"
									className="w-full p-2 border rounded mt-1 focus:outline-blue-500"
									aria-label="Description"
								/>
							)}
						/>
						{errors.description && (
							<Text slot="errorMessage" className="text-red-500 text-sm">
								{errors.description.message}
							</Text>
						)}
					</TextField>
				</div>
				<div className="mt-[40px] flex gap-2 justify-end">
					<Button
						type="button"
						onPress={onClose}
						className="px-4 py-2 text-sm border rounded hover:bg-gray-50 outline-none"
						isDisabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="px-4 py-2 text-sm border rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 outline-none"
						isDisabled={isSubmitting}
					>
						{isSubmitting ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</div>
		</Form>
	)
}
