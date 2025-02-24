import { useState } from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { updateSpace } from '@/app/lib/redux/features/space/spaceAPI'
import { updateSpaceName } from '@/app/lib/redux/features/space/spaceSlice'

interface SpaceRenameFormProps {
	spaceId: string
	initialName: string
	onClose: () => void
}

interface FormInputs {
	name: string
}

const SpaceRenameForm = ({
	spaceId,
	initialName,
	onClose,
}: SpaceRenameFormProps) => {
	const dispatch = useAppDispatch()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = useForm<FormInputs>({
		mode: 'onChange',
		defaultValues: {
			name: initialName,
		},
	})

	const onSubmit = async (data: FormInputs) => {
		try {
			setIsSubmitting(true)
			dispatch(updateSpaceName({ id: spaceId, name: data.name }))
			onClose()
			await dispatch(updateSpace({ id: spaceId, name: data.name })).unwrap()
		} catch (error) {
			console.error('スペースの更新に失敗しました:', error)
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
							className="w-full px-3 py-2 border rounded-sm focus:outline-blue-500"
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
					className="px-4 py-2 bg-gray-200 rounded-sm hover:bg-gray-300 outline-hidden"
					isDisabled={isSubmitting}
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 outline-hidden flex items-center gap-2"
					isDisabled={!isValid || isSubmitting}
				>
					{isSubmitting ? '更新中...' : '保存'}
				</Button>
			</div>
		</Form>
	)
}

export default SpaceRenameForm
