import { validateRuntimeEnvironment } from '@/lib/runtime-env-check'

// Validate environment at runtime in production
if (typeof window === 'undefined') {
	validateRuntimeEnvironment()
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return children
}
