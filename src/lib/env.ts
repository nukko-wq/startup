/**
 * Environment variable validation
 * Ensures all required environment variables are present at startup
 */

interface EnvVars {
	AUTH_GOOGLE_ID: string
	AUTH_GOOGLE_SECRET: string
	DATABASE_URL: string
	DIRECT_URL: string
	NEXTAUTH_SECRET: string
	NEXTAUTH_URL: string
	ALLOWED_EMAILS: string
}

const requiredEnvVars: (keyof EnvVars)[] = [
	'AUTH_GOOGLE_ID',
	'AUTH_GOOGLE_SECRET',
	'DATABASE_URL',
	'DIRECT_URL',
	'NEXTAUTH_SECRET',
	'NEXTAUTH_URL',
	'ALLOWED_EMAILS',
]

function validateEnvironmentVariables(): EnvVars {
	const missingVars: string[] = []
	
	// Only enforce strict validation at runtime in production
	// Skip validation during build process (including Vercel builds)
	const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
	                    process.env.npm_lifecycle_event === 'build' ||
	                    process.env.npm_lifecycle_event === 'vercel-build'
	
	const isRuntimeProduction = process.env.NODE_ENV === 'production' && !isBuildTime

	// Only validate at runtime in production
	if (isRuntimeProduction) {
		for (const envVar of requiredEnvVars) {
			if (!process.env[envVar] || process.env[envVar]?.trim() === '') {
				missingVars.push(envVar)
			}
		}

		if (missingVars.length > 0) {
			const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
			console.error(errorMessage)
			throw new Error(errorMessage)
		}
	}

	// Get values with defaults for development and build
	const AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID || 'dev-google-id'
	const AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET || 'dev-google-secret'
	const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/dev'
	const DIRECT_URL = process.env.DIRECT_URL || 'postgresql://localhost:5432/dev'
	const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-key-minimum-32-characters'
	const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
	const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS || 'dev@example.com'

	// Additional validation for runtime production only
	if (isRuntimeProduction) {
		if (!ALLOWED_EMAILS.includes('@')) {
			throw new Error('ALLOWED_EMAILS must contain at least one valid email address')
		}

		if (!DATABASE_URL.startsWith('postgresql://')) {
			throw new Error('DATABASE_URL must be a valid PostgreSQL connection string')
		}

		if (NEXTAUTH_SECRET.length < 32) {
			throw new Error('NEXTAUTH_SECRET must be at least 32 characters long')
		}
	}

	return {
		AUTH_GOOGLE_ID,
		AUTH_GOOGLE_SECRET,
		DATABASE_URL,
		DIRECT_URL,
		NEXTAUTH_SECRET,
		NEXTAUTH_URL,
		ALLOWED_EMAILS,
	}
}

// Validate environment variables at module load time
export const env = validateEnvironmentVariables()

// Export type for use in other files
export type ValidatedEnv = typeof env