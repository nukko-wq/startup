'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { spaceUpdateSchema } from '@/lib/validations/space'
import type { z } from 'zod'
import { useSpaceStore } from '@/app/store/spaceStore'
import type { Space } from '@/app/types/space'
import { useState } from 'react'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'

type FormData = z.infer<typeof spaceUpdateSchema>

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
	const { spaces, setSpaces, currentSpace, setCurrentSpace } = useSpaceStore()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { control, handleSubmit } = useForm<FormData>({
		resolver: zodResolver(spaceUpdateSchema),
		defaultValues: {
			name: initialName,
		},
	})

	const onSubmit = async (data: FormData) => {
		if (!currentSpace || !data.name) return
		setIsSubmitting(true)

		try {
			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: data.name }),
			})

			if (!response.ok) {
				throw new Error('スペースの更新に失敗しました')
			}

			const updatedSpace = await response.json()

			const updatedSpaces = spaces.map((space) =>
				space.id === spaceId ? { ...space, name: updatedSpace.name } : space,
			)

			const uniqueSpaces = Array.from(
				new Map(updatedSpaces.map((space) => [space.id, space])).values(),
			)

			setSpaces(uniqueSpaces)
			setCurrentSpace({ ...currentSpace, name: updatedSpace.name })
			onClose()
		} catch (error) {
			console.error('Error updating space:', error)
		} finally {
			setIsSubmitting(false)
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
							更新中...
						</>
					) : (
						'保存'
					)}
				</Button>
			</div>
		</Form>
	)
}

export default SpaceRenameForm
