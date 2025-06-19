/**
 * Secure logging utility that prevents sensitive information leakage in production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const secureLogger = {
	/**
	 * Log authentication-related events
	 * In production, logs generic messages without sensitive details
	 */
	auth: {
		info: (message: string, data?: any) => {
			if (isDevelopment) {
				console.log(`[AUTH] ${message}`, data)
			} else {
				console.log(`[AUTH] ${message}`)
			}
		},
		error: (message: string, error?: any) => {
			if (isDevelopment) {
				console.error(`[AUTH ERROR] ${message}`, error)
			} else {
				console.error(`[AUTH ERROR] ${message}`)
			}
		},
		warn: (message: string, data?: any) => {
			if (isDevelopment) {
				console.warn(`[AUTH WARN] ${message}`, data)
			} else {
				console.warn(`[AUTH WARN] ${message}`)
			}
		}
	},

	/**
	 * Log general application events
	 */
	app: {
		info: (message: string, data?: any) => {
			if (isDevelopment) {
				console.log(`[APP] ${message}`, data)
			} else {
				console.log(`[APP] ${message}`)
			}
		},
		error: (message: string, error?: any) => {
			if (isDevelopment) {
				console.error(`[APP ERROR] ${message}`, error)
			} else {
				console.error(`[APP ERROR] ${message}`)
			}
		}
	}
}