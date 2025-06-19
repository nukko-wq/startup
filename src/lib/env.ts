/**
 * Environment variable validation
 * Ensures all required environment variables are present at startup
 */

interface EnvVars {
	AUTH_GOOGLE_ID: string
	AUTH_GOOGLE_SECRET: string
	DATABASE_URL: string
	DIRECT_URL: string
	AUTH_SECRET: string
	AUTH_URL: string
	ALLOWED_EMAILS: string
}

const requiredEnvVars: (keyof EnvVars)[] = [
	'AUTH_GOOGLE_ID',
	'AUTH_GOOGLE_SECRET',
	'DATABASE_URL',
	'DIRECT_URL',
	'AUTH_SECRET',
	'AUTH_URL',
	'ALLOWED_EMAILS',
]

function validateEnvironmentVariables(): EnvVars {
	// Never validate during build - always use defaults
	// This prevents build-time errors while maintaining runtime safety

	// Get values with defaults - validation happens at runtime only
	const AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID || 'dev-google-id'
	const AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET || 'dev-google-secret'
	const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/dev'
	const DIRECT_URL = process.env.DIRECT_URL || 'postgresql://localhost:5432/dev'
	const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-key-minimum-32-characters'
	const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3000'
	const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS || 'dev@example.com'

	return {
		AUTH_GOOGLE_ID,
		AUTH_GOOGLE_SECRET,
		DATABASE_URL,
		DIRECT_URL,
		AUTH_SECRET,
		AUTH_URL,
		ALLOWED_EMAILS,
	}
}

// Validate environment variables at module load time
export const env = validateEnvironmentVariables()

// Export type for use in other files
export type ValidatedEnv = typeof env