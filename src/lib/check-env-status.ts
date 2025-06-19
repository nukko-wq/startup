/**
 * Check if environment variables are properly configured
 */

export function isEnvironmentConfigured(): boolean {
	// Check if we're using default values
	const defaultValues = [
		'dev-google-id',
		'dev-google-secret', 
		'dev-secret-key-minimum-32-characters',
		'postgresql://localhost:5432/dev',
		'http://localhost:3000',
		'dev@example.com'
	]

	if (typeof window !== 'undefined') {
		// Client-side: We can't check all env vars, so we return true
		// Server-side rendering will handle the actual check
		return true
	}

	// Server-side: Check actual environment variables
	const envVars = [
		process.env.AUTH_GOOGLE_ID,
		process.env.AUTH_GOOGLE_SECRET,
		process.env.AUTH_SECRET,
		process.env.AUTH_URL,
		process.env.DATABASE_URL,
		process.env.DIRECT_URL,
		process.env.ALLOWED_EMAILS,
	]

	// Check if any required var is missing or using default values
	for (const envVar of envVars) {
		if (!envVar || defaultValues.includes(envVar.trim())) {
			return false
		}
	}

	return true
}