'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { spaceCreateSchema } from '@/lib/validations/space'
import type { z } from 'zod'

type FormData = z.infer<typeof spaceCreateSchema>

interface SpaceRenameFormProps {
	spaceId: string
	initialName: string
	onClose: () => void
}

const SpaceRenameForm = ({
	spaceId,
	initialName,
	onClose,
}: SpaceRenameFormProps) => {
	const { control, handleSubmit } = useForm<FormData>({
		resolver: zodResolver(spaceCreateSchema),
		defaultValues: {
			name: initialName,
		},
	})

	const onSubmit = async (data: FormData) => {
		try {
			console.log('Submitting form with spaceId:', spaceId, 'and data:', data)

			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new Error('Failed to update space')
			}

			onClose()
			window.location.reload()
		} catch (error) {
			console.error('Space update error:', error)
			alert('スペース名の更新に失敗しました')
		}
	}

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
					保存
				</Button>
			</div>
		</Form>
	)
}

export default SpaceRenameForm
