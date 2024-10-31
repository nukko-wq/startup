import { EnvVarWarning } from '@/components/env-var-warning'
import HeaderAuth from '@/components/header-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { hasEnvVars } from '@/utils/supabase/check-env-vars'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'
import Link from 'next/link'
import './globals.css'
import './globalicons.css'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: 'http://localhost:3000'

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: 'StartUp',
	description: 'StartUp',
	robots: {
		index: false,
		follow: false,
	},
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await auth()
	return (
		<html lang="ja">
			<body className="">
				<SessionProvider session={session}>{children}</SessionProvider>
			</body>
		</html>
	)
}
