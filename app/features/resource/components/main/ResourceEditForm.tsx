'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import {
	resourceSchema,
	type ResourceFormData,
} from '../../schemas/resourceSchema'
import { Earth } from 'lucide-react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { updateResource as updateResourceAction } from '@/app/lib/redux/features/resource/resourceSlice'
import { updateResource } from '@/app/lib/redux/features/resource/resourceAPI'
import type { Resource } from '@/app/lib/redux/features/resource/types/resource'

interface ResourceEditFormProps {
	resource: Resource
	onClose: (isSubmit?: boolean) => void
}

const ResourceEditForm = ({ resource, onClose }: ResourceEditFormProps) => {
	const dispatch = useAppDispatch()

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<ResourceFormData>({
		resolver: zodResolver(resourceSchema),
		defaultValues: {
			url: resource.url,
			title: resource.title,
			description: resource.description || '',
		},
		mode: 'onChange',
	})

	const onSubmit = async (data: ResourceFormData) => {
		try {
			// 楽観的更新のために、まず先にReduxステートを更新
			const optimisticResource = {
				...resource,
				...data,
			}
			dispatch(updateResourceAction(optimisticResource))

			// フォームを即座に閉じる
			onClose(true)

			// バックグラウンドでAPIリクエストを実行
			try {
				const updatedResource = await updateResource({
					id: resource.id,
					...data,
				})

				// APIレスポンスで最終的な状態を更新
				dispatch(updateResourceAction(updatedResource))
			} catch (error) {
				// エラーが発生した場合は、元の状態に戻す
				dispatch(updateResourceAction(resource))
				console.error('リソースの更新に失敗しました:', error)
				// エラー通知を表示
			}
		} catch (error) {
			console.error('Failed to update resource:', error)
		}
	}

	return (
		<Form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col grow resource-edit-form"
		>
			<div className="flex items-center gap-2 border-b border-gray-200">
				<div className="border border-slate-200 rounded-xs ml-4 w-8 h-8 flex items-center justify-center">
					<Earth className="w-4 h-4 text-slate-700" />
				</div>
				<Controller
					name="title"
					control={control}
					render={({ field }) => (
						<div className="grow">
							<Input
								{...field}
								type="text"
								className="w-full py-4 px-2 rounded-t-lg outline-hidden text-lg"
								aria-label="Name"
							/>
							{errors.title && (
								<span className="text-red-500 text-sm">
									{errors.title.message}
								</span>
							)}
						</div>
					)}
				/>
			</div>
			<div className="flex flex-col px-[40px] py-[32px] gap-2">
				<div>
					<Label className="text-sm">URL</Label>
					<Controller
						name="url"
						control={control}
						render={({ field }) => (
							<div>
								<Input
									{...field}
									type="url"
									className={`w-full p-2 border rounded mt-1 focus:outline-blue-500 ${
										errors.url ? 'border-red-500' : ''
									}`}
									aria-label="URL"
								/>
								{errors.url && (
									<span className="text-red-500 text-sm">
										{errors.url.message}
									</span>
								)}
							</div>
						)}
					/>
				</div>
				<div>
					<TextField>
						<Label className="text-sm">Description</Label>
						<Controller
							name="description"
							control={control}
							render={({ field: { value, onChange, onBlur } }) => (
								<Input
									value={value}
									onChange={onChange}
									onBlur={onBlur}
									type="text"
									className="w-full p-2 border rounded-sm mt-1 focus:outline-blue-500"
									aria-label="Description"
								/>
							)}
						/>
					</TextField>
				</div>
				<div className="mt-[40px] flex gap-2 justify-end">
					<Button
						type="button"
						onPress={() => onClose(false)}
						className="px-4 py-2 text-sm border rounded-sm hover:bg-gray-50 outline-hidden"
					>
						キャンセル
					</Button>
					<Button
						type="submit"
						isDisabled={!isValid || isSubmitting}
						className="px-4 py-2 text-sm border rounded-sm bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 outline-hidden"
					>
						{isSubmitting ? '保存中...' : '保存'}
					</Button>
				</div>
			</div>
		</Form>
	)
}

export default ResourceEditForm
