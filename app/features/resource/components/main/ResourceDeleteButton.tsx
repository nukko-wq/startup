'use client'

import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import {
	removeResource,
	addResource,
} from '@/app/lib/redux/features/resource/resourceSlice'
import { deleteResource } from '@/app/lib/redux/features/resource/resourceAPI'
import { Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'

interface ResourceDeleteButtonProps {
	resourceId: string
}

const ResourceDeleteButton = ({ resourceId }: ResourceDeleteButtonProps) => {
	const dispatch = useAppDispatch()
	const [isTooltipVisible, setIsTooltipVisible] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	// 削除対象のリソースを取得
	const targetResource = useAppSelector((state) =>
		state.resource.resources.find((r) => r.id === resourceId),
	)

	const handleDelete = async () => {
		if (!targetResource) return

		try {
			setIsDeleting(true)

			// 楽観的に削除
			dispatch(removeResource(resourceId))

			try {
				// APIを呼び出して実際に削除
				await deleteResource(resourceId)
			} catch (error) {
				// APIエラー時は削除を取り消し（ロールバック）
				console.error('リソースの削除に失敗しました:', error)
				dispatch(addResource(targetResource))
			}
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<TooltipTrigger
			isOpen={isTooltipVisible}
			onOpenChange={setIsTooltipVisible}
			delay={700}
			closeDelay={0}
		>
			<Button
				className={`p-2 mr-1 transition-colors duration-200 rounded-full outline-hidden group/delete
					${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
				onPress={handleDelete}
				isDisabled={isDeleting}
			>
				<Trash2 className="w-5 h-5 text-gray-500 group-hover/delete:text-gray-700" />
			</Button>
			{isTooltipVisible && (
				<Tooltip className="bg-slate-800 text-slate-300 text-xs shadow-md rounded-lg px-2 py-1">
					<OverlayArrow>
						<svg
							width={8}
							height={8}
							viewBox="0 0 8 8"
							className="fill-slate-800"
							aria-labelledby="arrowTitle"
						>
							<title id="arrowTitle">ツールチップの矢印</title>
							<path d="M0 0 L4 4 L8 0" />
						</svg>
					</OverlayArrow>
					Remove Item
				</Tooltip>
			)}
		</TooltipTrigger>
	)
}

export default ResourceDeleteButton
