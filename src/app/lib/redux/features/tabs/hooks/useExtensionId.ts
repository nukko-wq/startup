import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'
// app/hooks/useExtensionId.ts
import { useEffect, useState } from 'react'

export const useExtensionId = () => {
	const [extensionId, setExtensionId] = useState<string | null>(null)

	useEffect(() => {
		const fetchExtensionId = async () => {
			try {
				const id = await tabsAPI.getExtensionId()
				setExtensionId(id)
			} catch (error) {
				console.error('拡張機能IDの取得に失敗しました:', error)
			}
		}

		fetchExtensionId()
	}, [])

	return extensionId
}
