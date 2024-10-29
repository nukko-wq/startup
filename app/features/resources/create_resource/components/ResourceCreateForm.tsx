import { resourceSchema, type ResourceSchema } from '@/lib/validations/resource'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { useForm } from 'react-hook-form'
import { createResource } from '@/app/features/resources/create_resource/actions/_actions'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'lucide-react'

interface ResourceCreateFormProps {
	onClose: () => void
}

const ResourceCreateForm = ({ onClose }: ResourceCreateFormProps) => {
	const urlInputRef = useRef<HTMLInputElement | null>(null)
	const [urlPlaceholder, setUrlPlaceholder] = useState('URL')

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
			}
			await createResource(submissionData)
			onClose()
		} catch (error) {
			console.error('Resource creation error:', error)
		}
	}

	return (
		<div className="flex">
			<div className="bg-zinc-100" aria-label="Side Menu">
				<div className="text-xl font-bold p-4">Add Resource</div>
				<div className="text-muted-foreground bg-foreground/10 p-2 flex items-center gap-1">
					<Link className="w-3 h-3" />
					<div>URL</div>
				</div>
			</div>
			<Form onSubmit={handleSubmit(onSubmit)} className="">
				<div className="flex flex-col p-9 space-y-4">
					<div className="">
						<TextField>
							<Label className="text-sm">URL</Label>
							<Input
								{...register('url')}
								ref={(e) => {
									register('url').ref(e)
									if (e) {
										urlInputRef.current = e
									}
								}}
								type="url"
								className="w-full p-2 border rounded mt-1 focus:outline-blue-500"
								placeholder={urlPlaceholder}
								aria-label="URL"
							/>
						</TextField>
					</div>
					<div className="">
						<TextField>
							<Label className="text-sm">Name</Label>
							<Input
								{...register('title')}
								type="text"
								className="w-full p-2 border-gray-200 rounded border focus:outline-blue-500"
								placeholder="Name"
								aria-label="Name"
							/>
						</TextField>
					</div>
					<div className="flex justify-between">
						<Button
							type="button"
							onPress={onClose}
							className="px-4 py-2 text-sm border rounded hover:bg-gray-200"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							isDisabled={isSubmitting || !isValid}
							className="px-4 py-2 text-sm border rounded bg-blue-500 disabled:bg-gray-200 text-white disabled:text-gray-700 hover:bg-blue-600 disabled:opacity-60"
						>
							ADD RESOURCE
						</Button>
					</div>
				</div>
			</Form>
		</div>
	)
}

export default ResourceCreateForm
