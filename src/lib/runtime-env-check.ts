/**
 * Runtime environment variable validation
 * This runs only when the application starts in production
 */

let hasValidated = false

export function validateRuntimeEnvironment() {
	// Only run once per process
	if (hasValidated) {
		return
	}

	// Only run in production at runtime (not during build)
	if (process.env.NODE_ENV !== 'production') {
		hasValidated = true
		return
	}

	// Skip if this is a build process
	if (process.env.NEXT_PHASE === 'phase-production-build') {
		hasValidated = true
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
		const value = process.env[envVar]
		if (!value || value.trim() === '' || value === 'dev-google-id' || value === 'dev-google-secret' || value === 'dev-secret-key-minimum-32-characters') {
			missingVars.push(envVar)
		}
	}

	if (missingVars.length > 0) {
		const errorMessage = `[RUNTIME] Missing or invalid environment variables: ${missingVars.join(', ')}`
		console.error(errorMessage)
		console.error('Please set these environment variables in your deployment platform.')
		throw new Error(errorMessage)
	}

	console.log('✅ All required environment variables are present and valid')
	hasValidated = true
}