import type { Workspace } from '@/app/lib/redux/features/workspace/types/workspace'
import { createWorkspace } from '@/app/lib/redux/features/workspace/workSpaceAPI'
import {
	addWorkspace,
	removeWorkspace,
	replaceWorkspace,
} from '@/app/lib/redux/features/workspace/workspaceSlice'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

interface WorkspaceFormData {
	name: string
}

interface WorkspaceCreateFormProps {
	onClose: () => void
}

const WorkspaceCreateForm = ({ onClose }: WorkspaceCreateFormProps) => {
	const dispatch = useAppDispatch()
	const {
		control,
		handleSubmit,
		formState: { isValid, isSubmitting },
	} = useForm<WorkspaceFormData>({
		mode: 'onChange',
		defaultValues: {
			name: '',
		},
	})

	const onSubmit = async (data: WorkspaceFormData) => {
		const tempId = uuidv4()
		const tempWorkspace: Workspace = {
			id: tempId,
			name: data.name,
			order: 0,
			isDefault: false,
			userId: '',
		}

		try {
			dispatch(addWorkspace(tempWorkspace))
			onClose()
			const result = await dispatch(createWorkspace(data.name)).unwrap()
			dispatch(replaceWorkspace({ tempId, workspace: result }))
		} catch (error) {
			dispatch(removeWorkspace(tempId))
			console.error('Failed to create workspace:', error)
		}
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<Controller
				name="name"
				control={control}
				rules={{ required: 'Name is required' }}
				render={({ field, fieldState }) => (
					<TextField
						isInvalid={!!fieldState.error}
						autoFocus
						className="space-y-[2px]"
					>
						<Label className="text-sm">ワークスペース名</Label>
						<Input
							{...field}
							className="w-full px-3 py-2 border rounded-sm focus:outline-blue-500"
						/>
						{fieldState.error && (
							<span className="text-red-500 text-sm">
								{fieldState.error.message}
							</span>
						)}
					</TextField>
				)}
			/>

			<div className="flex justify-end gap-2 text-sm">
				<Button
					onPress={onClose}
					type="button"
					className="px-4 py-2 bg-gray-200 rounded-sm hover:bg-gray-300 outline-hidden text-gray-700 cursor-pointer"
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					isDisabled={!isValid || isSubmitting}
					className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 outline-hidden flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				>
					作成
				</Button>
			</div>
		</Form>
	)
}

export default WorkspaceCreateForm
