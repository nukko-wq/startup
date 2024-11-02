'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'react-aria-components'
import { sectionSchema } from '@/lib/validations/section'
import { useState } from 'react'
import type { z } from 'zod'
import { useRef, useEffect } from 'react'

type FormData = z.infer<typeof sectionSchema>

interface SectionNameEditProps {
	initialName: string
	sectionId: string
	onEdit?: (name: string) => void
}

const SectionNameEdit = ({
	initialName,
	sectionId,
	onEdit,
}: SectionNameEditProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const inputRef = useRef<HTMLInputElement | null>(null)

	const { register, handleSubmit, reset } = useForm<FormData>({
		resolver: zodResolver(sectionSchema),
		defaultValues: {
			name: initialName,
		},
	})

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
			inputRef.current.select()
		}
	}, [isEditing])

	const onSubmit = async (data: FormData) => {
		if (data.name === initialName) {
			setIsEditing(false)
			return
		}

		try {
			const response = await fetch(`/api/sections/${sectionId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.message || '更新に失敗しました')
			}

			if (result.success) {
				onEdit?.(result.name)
				setIsEditing(false)
			}
		} catch (error) {
			console.error('Section name update error:', error)
			alert('セクション名の更新に失敗しました')
			reset({ name: initialName })
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			reset({ name: initialName })
			setIsEditing(false)
		}
	}

	if (!isEditing) {
		return (
			<Button
				onPress={() => setIsEditing(true)}
				className="text-xl font-semibold text-zinc-700 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded w-full text-left"
			>
				{initialName}
			</Button>
		)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<input
				{...register('name')}
				ref={(e) => {
					if (inputRef.current !== e) {
						inputRef.current = e
					}
					register('name').ref(e)
				}}
				onKeyDown={handleKeyDown}
				onBlur={handleSubmit(onSubmit)}
				className="text-xl font-semibold text-zinc-700 bg-slate-50 hover:bg-slate-50 px-2 py-1 rounded outline-none w-full"
			/>
		</form>
	)
}

export default SectionNameEdit
