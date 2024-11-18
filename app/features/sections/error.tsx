'use client'

import { useEffect } from 'react'
import { Button } from 'react-aria-components'

export default function SectionError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('セクションエラー:', error)
	}, [error])

	return (
		<div className="flex flex-col items-center justify-center p-4">
			<h2 className="text-lg font-semibold mb-2">エラーが発生しました</h2>
			<Button onPress={reset}>もう一度試す</Button>
		</div>
	)
}
