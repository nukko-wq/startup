import { validateRuntimeEnvironment } from '@/lib/runtime-env-check'
import { isEnvironmentConfigured } from '@/lib/check-env-status'
import EnvironmentError from '@/components/EnvironmentError'

// Validate environment at runtime in production
if (typeof window === 'undefined') {
	validateRuntimeEnvironment()
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	// Check environment configuration on server-side
	if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
		if (!isEnvironmentConfigured()) {
			return <EnvironmentError />
		}
	}

	return children
}
