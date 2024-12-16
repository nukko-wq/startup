'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Earth } from 'lucide-react'
import IconGoogle from '@/app/components/elements/IconGoogle'
import pageOutline from '@/app/assets/images/page_outline_white.png'

type GoogleServiceType =
	| 'docs'
	| 'sheets'
	| 'slides'
	| 'forms'
	| 'drive'
	| 'google'

interface ResourceIconProps {
	faviconUrl?: string | null
	url: string
	loading?: 'lazy' | 'eager'
}

const getGoogleServiceType = (url: string): GoogleServiceType | null => {
	try {
		const urlObj = new URL(url)
		const hostname = urlObj.hostname
		const pathname = urlObj.pathname

		if (hostname === 'drive.google.com') {
			return 'drive'
		}

		if (hostname === 'docs.google.com') {
			if (pathname.startsWith('/document/')) return 'docs'
			if (pathname.startsWith('/spreadsheets/')) return 'sheets'
			if (pathname.startsWith('/presentation/')) return 'slides'
			if (pathname.startsWith('/forms/')) return 'forms'
		}

		return null
	} catch {
		return null
	}
}

export default function ResourceIcon({
	faviconUrl,
	url,
	loading = 'eager',
}: ResourceIconProps) {
	const [mounted, setMounted] = useState(false)
	const [serviceType, setServiceType] = useState<GoogleServiceType | null>(null)

	useEffect(() => {
		setMounted(true)
		const type = getGoogleServiceType(url)
		setServiceType(type)
	}, [url])

	if (!mounted) {
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
			</div>
		)
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
			<div className="relative w-4 h-4">
				{serviceType ? (
					<IconGoogle variant={serviceType} className="w-4 h-4" />
				) : faviconUrl ? (
					<img
						src={faviconUrl}
						alt="Favicon"
						className="h-[16px] w-[16px]"
						loading={loading}
					/>
				) : (
					<Earth className="w-4 h-4 text-zinc-500" />
				)}
			</div>
		</div>
	)
}
