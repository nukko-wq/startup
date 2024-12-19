import type { Resource } from '@/app/lib/redux/features/resource/types/resource'

export const getResourceDescription = (resource: Resource): string => {
	if (resource.description) return resource.description

	const url = new URL(resource.url)
	const hostname = url.hostname
	const pathname = url.pathname

	if (hostname === 'mail.google.com') {
		return 'Gmail'
	}
	if (hostname === 'drive.google.com') {
		return 'Google Drive'
	}
	if (hostname === 'github.com') {
		return 'GitHub'
	}

	if (hostname === 'docs.google.com') {
		if (pathname.startsWith('/forms/')) {
			return 'Google Form'
		}
		if (pathname.startsWith('/spreadsheets/')) {
			return 'Google Sheet'
		}
		if (pathname.startsWith('/document/')) {
			return 'Google Doc'
		}
	}

	return 'Webpage'
}
