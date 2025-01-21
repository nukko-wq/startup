'use client'

import { Button, Form, Input, Text } from 'react-aria-components'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/lib/redux/hooks'
import { selectActiveSpace } from '@/app/lib/redux/features/space/selector'
import { updateSpace } from '@/app/lib/redux/features/space/spaceAPI'
import { updateSpaceName } from '@/app/lib/redux/features/space/spaceSlice'

const Header = () => {
	const dispatch = useAppDispatch()
	const activeSpace = useAppSelector(selectActiveSpace)
	const [isEditing, setIsEditing] = useState(false)
	const [editingName, setEditingName] = useState(activeSpace?.name || '')
	const [previousName, setPreviousName] = useState('')

	if (!activeSpace) {
		return (
			<div className="flex items-center justify-between p-4 w-full">
				<div className="flex items-center gap-2">
					<Text className="text-xl font-bold text-slate-800 pl-4">
						Loading...
					</Text>
				</div>
			</div>
		)
	}

	const handleEditStart = () => {
		if (activeSpace) {
			setEditingName(activeSpace.name)
			setPreviousName(activeSpace.name)
			setIsEditing(true)
		}
	}

	const handleEditSubmit = async () => {
		if (activeSpace && editingName.trim() !== '') {
			const newName = editingName.trim()

			// 楽観的更新
			dispatch(
				updateSpaceName({
					id: activeSpace.id,
					name: newName,
				}),
			)

			setIsEditing(false)

			try {
				await dispatch(
					updateSpace({
						id: activeSpace.id,
						name: newName,
					}),
				).unwrap()
			} catch (error) {
				// エラー時に元の名前に戻す
				dispatch(
					updateSpaceName({
						id: activeSpace.id,
						name: previousName,
					}),
				)
				console.error('スペース名の更新に失敗しました:', error)
			}
		}
	}

	const handleEditCancel = () => {
		setEditingName(activeSpace?.name || '')
		setIsEditing(false)
	}

	return (
		<div className="flex items-center justify-between p-4 w-full">
			<div className="flex items-center">
				{isEditing ? (
					<Form
						className="flex items-center"
						onSubmit={(e) => {
							e.preventDefault()
							handleEditSubmit()
						}}
					>
						<Input
							autoFocus
							value={editingName}
							onChange={(e) => setEditingName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Escape') {
									handleEditCancel()
								}
							}}
							onBlur={handleEditCancel}
							className="text-xl font-bold py-1 pl-6 text-slate-800 bg-transparent border-b-2 border-blue-500 outline-none"
							onFocus={(e) => {
								const input = e.target as HTMLInputElement
								const length = input.value.length
								input.setSelectionRange(length, length)
							}}
						/>
					</Form>
				) : (
					<Button
						className="group flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1 outline-none border-b-2 border-transparent"
						onPress={handleEditStart}
						aria-label="Space Name"
					>
						<Text className="text-xl font-bold text-slate-800 pl-4">
							{activeSpace?.name || 'Select a Space'}
						</Text>
						<Pencil className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</Button>
				)}
			</div>
		</div>
	)
}

export default Header
