'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { z } from 'zod'

// 新しいスキーマを作成
const createFormSchema = z.object({
	name: z.string().min(1, '名前を入力してください'),
})

type FormData = z.infer<typeof createFormSchema>

interface CreateSpaceFormProps {
	onClose: () => void
	onSubmit: (data: { name: string }) => Promise<void>
}

export default function CreateSpaceForm({
	onClose,
	onSubmit,
}: CreateSpaceFormProps) {
	const { control, handleSubmit } = useForm<FormData>({
		resolver: zodResolver(createFormSchema),
		defaultValues: {
			name: '',
		},
	})

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-none"
				>
					作成
				</Button>
			</div>
		</Form>
	)
}
