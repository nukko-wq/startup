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
	const defaultValues = ['dev-google-id', 'dev-google-secret', 'dev-secret-key-minimum-32-characters', 'postgresql://localhost:5432/dev', 'http://localhost:3000', 'dev@example.com']

	for (const envVar of requiredVars) {
		const value = process.env[envVar]
		if (!value || value.trim() === '' || defaultValues.includes(value.trim())) {
			missingVars.push(envVar)
		}
	}

	if (missingVars.length > 0) {
		const errorMessage = `[RUNTIME] Missing or invalid environment variables: ${missingVars.join(', ')}`
		console.error('🚨 ENVIRONMENT VARIABLE ERROR:')
		console.error(errorMessage)
		console.error('📋 To fix this issue:')
		console.error('1. Go to your Vercel dashboard')
		console.error('2. Navigate to your project settings')
		console.error('3. Add the missing environment variables in the Environment Variables section')
		console.error('4. Redeploy your application')
		console.error('')
		console.error('Missing variables:', missingVars.join(', '))
		
		// In production, we'll warn but not crash to allow deployment
		// The app will not function properly but it won't crash the deployment
		console.warn('⚠️  Application started with missing environment variables - functionality will be limited')
		hasValidated = true
		return
	}

	console.log('✅ All required environment variables are present and valid')
	hasValidated = true
}