import { useState } from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import { createSpace } from '@/app/lib/redux/features/space/spaceAPI'
import { addOptimisticSpace } from '@/app/lib/redux/features/space/spaceSlice'
import { v4 as uuidv4 } from 'uuid'
import type { RootState } from '@/app/lib/redux/store'

interface SpaceCreateFormProps {
	workspaceId: string
	onClose: () => void
}

interface FormInputs {
	name: string
}

const SpaceCreateForm = ({ workspaceId, onClose }: SpaceCreateFormProps) => {
	const dispatch = useAppDispatch()
	const spaces = useAppSelector((state: RootState) => state.space.spaces)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = useForm<FormInputs>({
		mode: 'onChange',
		defaultValues: {
			name: '',
		},
	})

	const onSubmit = async (data: FormInputs) => {
		try {
			setIsSubmitting(true)

			const maxOrder = Math.max(
				...spaces
					.filter((space) => space.workspaceId === workspaceId)
					.map((space) => space.order),
				-1,
			)

			const optimisticSpace = {
				id: uuidv4(),
				name: data.name,
				workspaceId,
				order: maxOrder + 1,
				isLastActive: false,
				isDefault: false,
			}

			dispatch(addOptimisticSpace(optimisticSpace))
			onClose()

			await dispatch(
				createSpace({
					name: data.name,
					workspaceId,
				}),
			).unwrap()
		} catch (error) {
			console.error('スペースの作成に失敗しました:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<Controller
				name="name"
				control={control}
				rules={{
					required: 'スペース名は必須です',
					minLength: { value: 1, message: 'スペース名を入力してください' },
				}}
				render={({ field, fieldState }) => (
					<TextField
						isInvalid={!!fieldState.error}
						autoFocus
						className="space-y-[2px]"
					>
						<Label className="text-sm">スペース名</Label>
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
					className="px-4 py-2 border rounded hover:bg-gray-50 outline-none"
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					isDisabled={!isValid || isSubmitting}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? '作成中...' : '作成'}
				</Button>
			</div>
		</Form>
	)
}

export default SpaceCreateForm
