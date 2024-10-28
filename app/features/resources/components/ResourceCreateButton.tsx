'use client'

import { useState } from 'react'
import { Button } from 'react-aria-components'
import { FilePlus } from 'lucide-react'

const ResourceCreateButton = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const onClick = async () => {
		try {
			setIsLoading(true)

			const response = await fetch('/api/resources', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: 'Untitled',
					url: 'https://example.com',
					position: 3,
				}),
			})

			setIsLoading(false)
			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to create resource')
			}
			const resource = await response.json()
			console.log('Resource created:', resource)
		} catch (error) {
			console.error('Error creating resource:', error)
			setError(
				error instanceof Error ? error.message : 'Failed to create resource',
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="mr-4">
			<Button type="button" onPress={onClick}>
				<FilePlus className="w-6 h-6 text-zinc-700" />
			</Button>
		</div>
	)
}

export default ResourceCreateButton
