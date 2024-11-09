'use client'

import { useState, useEffect } from 'react'
import HeaderMenu from '@/app/features/header/header_menu/HeaderMenu'
import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import { Button, TextField, Input, Label, Text } from 'react-aria-components'
import { Pencil } from 'lucide-react'

interface HeaderProps {
	spaceName: string
	spaceId: string
}

export default function Header({ spaceName, spaceId }: HeaderProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editedName, setEditedName] = useState(spaceName)
	const { setSpaces, handleSpaceClick } = useSpaces()

	// spaceNameが変更されたときにeditedNameを更新
	useEffect(() => {
		setEditedName(spaceName)
		setIsEditing(false)
	}, [spaceName])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editedName.trim() || editedName === spaceName) {
			setIsEditing(false)
			return
		}

		// 楽観的更新を即座に適用
		const previousName = spaceName
		setSpaces((prevSpaces) =>
			prevSpaces.map((space) =>
				space.id === spaceId ? { ...space, name: editedName } : space,
			),
		)
		setIsEditing(false)

		try {
			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: editedName }),
			})

			if (!response.ok) {
				throw new Error('Failed to update space name')
			}

			await handleSpaceClick(spaceId)
		} catch (error) {
			// エラー時に元の状態に戻す
			console.error('Error updating space name:', error)
			setSpaces((prevSpaces) =>
				prevSpaces.map((space) =>
					space.id === spaceId ? { ...space, name: previousName } : space,
				),
			)
			setEditedName(previousName)
			alert('スペース名の更新に失敗しました')
		}
	}

	return (
		<div className="flex items-center justify-between p-4 w-full">
			<div className="flex items-center gap-2">
				{isEditing ? (
					<form onSubmit={handleSubmit} className="flex items-center">
						<TextField
							autoFocus
							className="space-y-0"
							value={editedName}
							onChange={setEditedName}
							onBlur={() => {
								setIsEditing(false)
								setEditedName(spaceName)
							}}
						>
							<Input className="text-xl font-bold pl-4 text-zinc-800 bg-transparent border-b-2 border-blue-500 outline-none" />
						</TextField>
					</form>
				) : (
					<Button
						className="group flex items-center gap-2 hover:bg-zinc-100 rounded-lg px-2 py-1 outline-none"
						onPress={() => setIsEditing(true)}
					>
						<Text className="text-xl font-bold pl-4 text-zinc-800">
							{spaceName}
						</Text>
						<Pencil className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</Button>
				)}
			</div>
			<HeaderMenu spaceId={spaceId} spaceName={spaceName} />
		</div>
	)
}
