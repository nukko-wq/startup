'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resourceSchema, type ResourceSchema } from '@/lib/validations/resource'
import type { Resource } from '@prisma/client'
import { useRouter } from 'next/navigation'
import {
	Form,
	TextField,
	Input,
	Label,
	Text,
	Button,
} from 'react-aria-components'
import { Earth } from 'lucide-react'

interface ResourceEditFormProps {
	resource: Pick<Resource, 'id' | 'title' | 'url' | 'description'>
	onClose: () => void
}

export default function ResourceEditForm({
	resource,
	onClose,
}: ResourceEditFormProps) {
	const router = useRouter()

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
			const response = await fetch(`/api/resources/${resource.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				const errorData = await response.json()
				if (response.status === 404) {
					throw new Error('Resource not found')
				}
				throw new Error(errorData.error || 'Failed to update resource')
			}

			router.refresh()
			onClose()
		} catch (err) {
			setError('root', {
				message:
					err instanceof Error ? err.message : 'Failed to update resource',
			})
		}
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow">
			<div className="flex items-center gap-2 border-b border-gray-200">
				<div className="border border-gray-200 rounded-sm p-2 ml-4">
					<Earth className="w-4 h-4" />
				</div>
				<Input
					{...register('title')}
					type="text"
					className="w-full py-4 px-2 rounded-t-lg outline-none text-lg"
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
									className="w-full p-2 border rounded mt-1 outline-none"
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
									className="w-full p-2 border rounded mt-1 outline-none"
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
