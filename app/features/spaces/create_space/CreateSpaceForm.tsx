'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { z } from 'zod'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'
import { useState } from 'react'

// 新しいスキーマを作成
const createFormSchema = z.object({
	name: z.string().min(1, '名前を入力してください'),
})

type FormData = z.infer<typeof createFormSchema>

interface CreateSpaceFormProps {
	onClose: () => void
	onSubmit: (
		data: { name: string; workspaceId: string },
		close: () => void,
	) => Promise<void>
	workspaceId: string
}

export default function CreateSpaceForm({
	onClose,
	onSubmit,
	workspaceId,
}: CreateSpaceFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { control, handleSubmit } = useForm<FormData>({
		resolver: zodResolver(createFormSchema),
		defaultValues: {
			name: '',
		},
	})

	const handleFormSubmit = async (data: FormData) => {
		setIsSubmitting(true)
		try {
			await onSubmit({ ...data, workspaceId }, onClose)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
			<Controller
				name="name"
				control={control}
				render={({ field, fieldState }) => (
					<TextField
						isInvalid={!!fieldState.error}
						autoFocus
						className="space-y-[2px]"
					>
						<Label className="text-sm">Space Name</Label>
						<Input
							{...field}
							className="w-full px-3 py-2 border rounded focus:outline-blue-500"
						/>
						{fieldState.error && (
							<div className="text-red-500 text-sm">
								{fieldState.error.message}
							</div>
						)}
					</TextField>
				)}
			/>
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					onPress={onClose}
					className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 outline-none"
					isDisabled={isSubmitting}
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-none flex items-center gap-2"
					isDisabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<LoadingSpinner className="w-4 h-4" />
							作成中...
						</>
					) : (
						'作成'
					)}
				</Button>
			</div>
		</Form>
	)
}
