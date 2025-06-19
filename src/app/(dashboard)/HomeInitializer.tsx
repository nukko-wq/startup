'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HomeInitializerProps {
	activeSpaceId: string
}

const HomeInitializer = ({ activeSpaceId }: HomeInitializerProps) => {
	const router = useRouter()

	useEffect(() => {
		// クライアントサイドでのみ実行
		if (window.location.pathname === '/') {
			router.replace(`/space/${activeSpaceId}`)
		}
	}, [activeSpaceId, router])

	return null
}

export default HomeInitializer
