import type { Metadata } from 'next'
import '@/app/globals.css'
// Validate environment variables at application startup
import '@/lib/env'

export const metadata: Metadata = {
	title: 'Startup',
	description: 'Startup',
	robots: {
		index: false,
		follow: false,
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="ja">
			<body>{children}</body>
		</html>
	)
}
