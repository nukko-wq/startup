import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button, Form, Input, Text } from 'react-aria-components'
import { useForm, Controller } from 'react-hook-form'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import {
	updateSection,
	revertSection,
} from '@/app/lib/redux/features/section/sectionSlice'
import { updateSectionName } from '@/app/lib/redux/features/section/sectionAPI'
import type { Section } from '@/app/lib/redux/features/section/types/section'

interface SectionNameEditProps {
	section: Section
}

interface FormInputs {
	name: string
}

const SectionNameEdit = ({ section }: SectionNameEditProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const dispatch = useAppDispatch()

	const { control, handleSubmit } = useForm<FormInputs>({
		defaultValues: {
			name: section.name,
		},
	})

	const handleEditStart = () => {
		setIsEditing(true)
	}

	const onSubmit = async (data: FormInputs) => {
		const originalSection = { ...section }
		const optimisticSection = { ...section, name: data.name }

		try {
			// 楽観的更新
			dispatch(updateSection(optimisticSection))
			setIsEditing(false)

			// API呼び出し
			const updatedSection = await updateSectionName(section.id, data.name)
			// API呼び出しが成功した場合は、サーバーからの応答で更新
			dispatch(updateSection(updatedSection))
		} catch (error) {
			console.error('セクション名の更新に失敗しました:', error)
			// エラーが発生した場合は元の状態に戻す
			dispatch(revertSection(originalSection))
		}
	}

	return (
		<div className="flex items-center">
			{isEditing ? (
				<Form className="flex items-center" onSubmit={handleSubmit(onSubmit)}>
					<Controller
						name="name"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<Input
								{...field}
								className="text-[17px] px-3 py-1 bg-transparent border-b-2 outline-none border-blue-500 text-slate-800"
								autoFocus
								onBlur={() => {
									field.onBlur()
									handleSubmit(onSubmit)()
								}}
								onKeyDown={(e) => {
									if (e.key === 'Escape') {
										setIsEditing(false)
									}
								}}
							/>
						)}
					/>
				</Form>
			) : (
				<Button
					className="group/section-name flex items-center gap-2 hover:bg-slate-100 rounded px-3 py-2 outline-none"
					onPress={handleEditStart}
					aria-label="Section Name"
				>
					<Text className="text-[17px] text-slate-800">{section.name}</Text>
					<Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover/section-name:opacity-100 transition-opacity" />
				</Button>
			)}
		</div>
	)
}

export default SectionNameEdit
