/**
 * Runtime environment variable validation
 * This runs only when the application starts in production
 */

export function validateRuntimeEnvironment() {
	// Only run in production at runtime (not during build)
	if (process.env.NODE_ENV !== 'production') {
		return
	}

	// Skip if this is a build process
	if (process.env.NEXT_PHASE === 'phase-production-build') {
		return
	}

	const requiredVars = [
		'AUTH_GOOGLE_ID',
		'AUTH_GOOGLE_SECRET',
		'DATABASE_URL',
		'DIRECT_URL',
		'NEXTAUTH_SECRET',
		'NEXTAUTH_URL',
		'ALLOWED_EMAILS',
	]

	const missingVars: string[] = []

	for (const envVar of requiredVars) {
		if (!process.env[envVar] || process.env[envVar]?.trim() === '') {
			missingVars.push(envVar)
		}
	}

	if (missingVars.length > 0) {
		const errorMessage = `[RUNTIME] Missing required environment variables: ${missingVars.join(', ')}`
		console.error(errorMessage)
		console.error('Please set these environment variables in your deployment platform.')
		throw new Error(errorMessage)
	}

	console.log('✅ All required environment variables are present')
}