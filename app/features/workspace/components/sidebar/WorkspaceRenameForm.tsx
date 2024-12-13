import { useState } from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { updateWorkspaceName } from '@/app/lib/redux/features/workspace/workspaceSlice'
import { updateWorkspace } from '@/app/lib/redux/features/workspace/workSpaceAPI'
import type { Workspace } from '@/app/lib/redux/features/workspace/types/workspace'

interface WorkspaceRenameFormProps {
	workspace: Workspace
	onClose: () => void
}

interface FormData {
	name: string
}

const WorkspaceRenameForm = ({
	workspace,
	onClose,
}: WorkspaceRenameFormProps) => {
	const dispatch = useAppDispatch()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { control, handleSubmit } = useForm<FormData>({
		defaultValues: {
			name: workspace.name,
		},
	})

	const onSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true)
			// 楽観的更新
			dispatch(updateWorkspaceName({ id: workspace.id, name: data.name }))
			onClose()

			// APIリクエスト
			await dispatch(
				updateWorkspace({ id: workspace.id, name: data.name }),
			).unwrap()
		} catch (error) {
			console.error('Failed to update workspace:', error)
			// エラー時に元の名前に戻す
			dispatch(updateWorkspaceName({ id: workspace.id, name: workspace.name }))
			// TODO: エラー通知の実装
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
					required: 'ワークスペース名は必須です',
					minLength: {
						value: 1,
						message: 'ワークスペース名を入力してください',
					},
				}}
				render={({ field, fieldState }) => (
					<TextField
						isInvalid={!!fieldState.error}
						autoFocus
						className="space-y-[2px]"
					>
						<Label className="text-sm">ワークスペース名</Label>
						<Input
							{...field}
							className="w-full px-3 py-2 border rounded focus:outline-blue-500"
							onFocus={(e) => {
								const input = e.target as HTMLInputElement
								const length = input.value.length
								input.setSelectionRange(length, length)
							}}
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
					{isSubmitting ? '更新中...' : '保存'}
				</Button>
			</div>
		</Form>
	)
}

export default WorkspaceRenameForm
