// app/hooks/useExtensionId.ts
import { useState, useEffect } from 'react'

export const useExtensionId = () => {
	const [extensionId, setExtensionId] = useState<string | null>(null)

	useEffect(() => {
		const fetchExtensionId = async () => {
			try {
				const response = await fetch('/api/extension/id')
				const data = await response.json()
				if (data.extensionIds?.[0]) {
					setExtensionId(data.extensionIds[0])
				}
			} catch (error) {
				console.error('拡張機能IDの取得に失敗しました:', error)
			}
		}

		fetchExtensionId()
	}, [])

	return extensionId
}
