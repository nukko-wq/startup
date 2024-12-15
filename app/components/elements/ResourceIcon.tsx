'use client'

import Image from 'next/image'
import { Earth } from 'lucide-react'
import IconGoogle from '@/app/components/elements/IconGoogle'
import pageOutline from '@/app/assets/images/page_outline_white.png'

interface ResourceIconProps {
	faviconUrl?: string | null
	mimeType?: string | null
	isGoogleDrive?: boolean
	loading?: 'lazy' | 'eager'
}

export default function ResourceIcon({
	faviconUrl,
	mimeType,
	isGoogleDrive,
	loading = 'eager',
}: ResourceIconProps) {
	const getGoogleIcon = () => {
		switch (mimeType) {
			case 'application/vnd.google-apps.document':
				return <IconGoogle variant="docs" className="w-4 h-4" />
			case 'application/vnd.google-apps.spreadsheet':
				return <IconGoogle variant="sheets" className="w-4 h-4" />
			case 'application/vnd.google-apps.presentation':
				return <IconGoogle variant="slides" className="w-4 h-4" />
			case 'application/vnd.google-apps.form':
				return <IconGoogle variant="forms" className="w-4 h-4" />
			default:
				return <IconGoogle variant="drive" className="w-4 h-4" />
		}
	}

	return (
		<div className="relative w-8 h-8 p-1 top-[2px]">
			<Image
				src={pageOutline}
				width={32}
				height={32}
				alt="page_outline"
				className="absolute -left-1 -top-1 h-[32px] w-[32px]"
				loading={loading}
			/>
			{faviconUrl || isGoogleDrive ? (
				<div className="relative h-[16px] w-[16px]">
					{isGoogleDrive ? (
						getGoogleIcon()
					) : (
						<img
							src={faviconUrl ?? undefined}
							alt="Favicon"
							className="relative h-[16px] w-[16px]"
							loading={loading}
						/>
					)}
				</div>
			) : (
				<Earth className="w-4 h-4 text-zinc-500" />
			)}
		</div>
	)
}
