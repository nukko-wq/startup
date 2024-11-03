'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Form, TextField, Input } from 'react-aria-components'
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

	const { control, handleSubmit, reset } = useForm<FormData>({
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

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			console.log('Global keydown:', e.key, e.target)
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])

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
		e.stopPropagation()
		if (e.key === 'Escape') {
			reset({ name: initialName })
			setIsEditing(false)
		}
	}

	// 別のコンポーネントとして分離
	const TestForm = () => {
		return (
			<div style={{ position: 'relative', zIndex: 1000 }}>
				<form id="test-form">
					<input
						className="bg-gray-500 text-white"
						onKeyDown={(e) => e.stopPropagation()}
					/>
				</form>
			</div>
		)
	}

	if (!isEditing) {
		return (
			<>
				<Button
					onPress={() => setIsEditing(true)}
					className="text-xl font-semibold text-zinc-700 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded w-full text-left outline-none"
					excludeFromTabOrder
				>
					{initialName}
				</Button>
				<TestForm />
			</>
		)
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<TextField>
				<Controller
					control={control}
					name="name"
					render={({ field: { value, onChange, onBlur, ref } }) => (
						<Input
							ref={(e) => {
								inputRef.current = e
								ref(e)
							}}
							value={value}
							onChange={onChange}
							onBlur={(e) => {
								// メニューボタンをクリックした場合は処理をスキップ
								const relatedTarget = e.relatedTarget as HTMLElement
								if (relatedTarget?.closest('[role="menu"]')) {
									return
								}
								onBlur()
								handleSubmit(onSubmit)(e)
							}}
							onKeyDown={handleKeyDown}
							className="text-xl font-semibold text-zinc-700 bg-slate-50 hover:bg-slate-50 px-2 py-1 rounded outline-none w-full"
						/>
					)}
				/>
			</TextField>
		</Form>
	)
}

export default SectionNameEdit
