import { resourceSchema, type ResourceSchema } from '@/lib/validations/resource'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { createResource } from '@/app/features/resources/create_resource/actions/_actions'

interface ResourceCreateFormProps {
	onClose: () => void
}

const ResourceCreateForm = ({ onClose }: ResourceCreateFormProps) => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResourceSchema>({
		resolver: zodResolver(resourceSchema),
	})

	const onSubmit = async (data: ResourceSchema) => {
		try {
			const submissionData = {
				...data,
				title: data.title || data.url,
			}
			await createResource(submissionData)
			onClose()
		} catch (error) {
			console.error('Resource creation error:', error)
		}
	}

	return (
		<div>
			<Form onSubmit={handleSubmit(onSubmit)} className="">
				<div className="flex flex-col p-9 space-y-4">
					<div className="">
						<TextField>
							<Label className="text-sm">URL</Label>
							<Input
								{...register('url')}
								type="url"
								className="w-full p-2 border rounded mt-1 outline-none"
								placeholder="https://example.com"
							/>
						</TextField>
					</div>
					<div className="">
						<TextField>
							<Label className="text-sm">Name</Label>
							<Input
								{...register('title')}
								type="text"
								className="w-full p-2 border-gray-200 rounded border outline-none"
								placeholder="Name"
							/>
						</TextField>
					</div>
					<div className="flex justify-between">
						<Button
							type="button"
							onPress={onClose}
							className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							isDisabled={isSubmitting}
							className="px-4 py-2 text-sm border rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
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
