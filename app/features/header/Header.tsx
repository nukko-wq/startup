'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useMemo } from 'react'
import HeaderMenu from '@/app/features/header/header_menu/HeaderMenu'
import { useSpaceStore } from '@/app/store/spaceStore'
import { Button, Input, Text } from 'react-aria-components'
import { Pencil } from 'lucide-react'
import type { Space } from '@/app/types/space'

const spaceSchema = z.object({
	name: z
		.string()
		.min(1, '名前は必須です')
		.max(50, '名前は50文字以内にしてください'),
})

type SpaceFormData = z.infer<typeof spaceSchema>

interface HeaderProps {
	spaceName: string
	spaceId: string
}

export default function Header({
	spaceName: initialSpaceName,
	spaceId,
}: HeaderProps) {
	const [isEditing, setIsEditing] = useState(false)
	const currentSpace = useSpaceStore((state) => state.currentSpace)
	const setCurrentSpace = useSpaceStore((state) => state.setCurrentSpace)
	const spaces = useSpaceStore((state) => state.spaces)
	const setSpaces = useSpaceStore((state) => state.setSpaces)

	const displayName = useMemo(() => {
		if (currentSpace?.name) return currentSpace.name
		const space = spaces.find((s) => s.id === spaceId)
		return space?.name || initialSpaceName
	}, [currentSpace?.name, spaces, spaceId, initialSpaceName])

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SpaceFormData>({
		resolver: zodResolver(spaceSchema),
		defaultValues: {
			name: displayName,
		},
	})

	useEffect(() => {
		reset({ name: displayName })
	}, [displayName, reset])

	const onSubmit = async (data: SpaceFormData) => {
		if (data.name === displayName) {
			setIsEditing(false)
			return
		}

		try {
			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: data.name }),
			})

			if (!response.ok) {
				throw new Error('Failed to update space name')
			}

			if (!currentSpace) {
				throw new Error('Current space not found')
			}

			const updatedSpace: Space = {
				...currentSpace,
				name: data.name,
			}

			setCurrentSpace(updatedSpace)
			setSpaces(
				spaces.map((space) => (space.id === spaceId ? updatedSpace : space)),
			)

			setIsEditing(false)
		} catch (error) {
			console.error('Error updating space name:', error)
			reset({ name: displayName })
			alert('スペース名の更新に失敗しました')
		}
	}

	return (
		<div className="flex items-center justify-between p-4 w-full">
			<div className="flex items-center gap-2">
				{isEditing ? (
					<form onSubmit={handleSubmit(onSubmit)} className="flex items-center">
						<Input
							autoFocus
							{...register('name')}
							className="text-xl font-bold pl-4 text-zinc-800 bg-transparent border-b-2 border-blue-500 outline-none"
							onFocus={(e) => {
								const input = e.target as HTMLInputElement
								const length = input.value.length
								input.setSelectionRange(length, length)
							}}
							onBlur={() => {
								setIsEditing(false)
								reset({ name: displayName })
							}}
						/>
						{errors.name && (
							<span className="text-red-500 text-sm ml-2">
								{errors.name.message}
							</span>
						)}
					</form>
				) : (
					<Button
						className="group flex items-center gap-2 hover:bg-zinc-100 rounded-lg px-2 py-1 outline-none"
						onPress={() => setIsEditing(true)}
					>
						<Text className="text-xl font-bold pl-4 text-zinc-800">
							{displayName}
						</Text>
						<Pencil className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</Button>
				)}
			</div>
			<HeaderMenu spaceId={spaceId} spaceName={initialSpaceName} />
		</div>
	)
}
