'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	Button,
	Form,
	TextField,
	Input,
	DialogTrigger,
	TooltipTrigger,
	Tooltip,
	OverlayArrow,
	ModalOverlay,
	Modal,
	Dialog,
} from 'react-aria-components'
import { sectionSchema } from '@/lib/validations/section'
import { useState } from 'react'
import type { z } from 'zod'
import { useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import ResourceEditForm from '@/app/features/resources/edit_resource/components/ResourceEditForm'

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
	const [isOpen, setIsOpen] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const { control, handleSubmit, reset } = useForm<FormData>({
		resolver: zodResolver(sectionSchema),
		defaultValues: {
			name: initialName,
		},
	})

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.select()
		}
	}, [isOpen])

	const onSubmit = async (data: FormData) => {
		if (data.name === initialName) {
			setIsOpen(false) // 変更がない場合はモーダルを閉じる
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
				setIsOpen(false) // 成功時にモーダルを閉じる
			}
		} catch (error) {
			console.error('Section name update error:', error)
			alert('セクション名の更新に失敗しました')
			reset({ name: initialName })
		}
	}

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			reset({ name: initialName })
		}
		setIsOpen(open)
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
			<TooltipTrigger delay={700} closeDelay={0}>
				<Button
					aria-label="Edit"
					className="text-[17px] outline-none px-3 py-2 hover:bg-zinc-200 rounded-full"
				>
					{initialName}
				</Button>
				<Tooltip className="bg-zinc-800 text-zinc-300 text-sm shadow-md rounded-lg px-2 py-1">
					<OverlayArrow>
						{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
						<svg
							width={8}
							height={8}
							viewBox="0 0 8 8"
							className="fill-zinc-800"
						>
							<path d="M0 0 L4 4 L8 0" />
						</svg>
					</OverlayArrow>
					Edit
				</Tooltip>
			</TooltipTrigger>
			<ModalOverlay
				isDismissable
				className="fixed flex top-0 left-0 w-screen h-screen z-100 bg-black/20 items-center justify-center"
			>
				<Modal className="flex items-center justify-center outline-none">
					<Dialog className="outline-none">
						<Form onSubmit={handleSubmit(onSubmit)}>
							<TextField autoFocus>
								<Controller
									control={control}
									name="name"
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
											ref={inputRef}
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											className="text-xl font-semibold text-zinc-700 bg-slate-50 hover:bg-slate-50 px-2 py-1 rounded outline-none w-full"
										/>
									)}
								/>
							</TextField>
						</Form>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default SectionNameEdit
