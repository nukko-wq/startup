/**
 * 環境変数の検証
 * 起動時にすべての必須環境変数が存在することを保証する
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
	// 開発環境か本番環境かを判定
	const isDevelopment = process.env.NODE_ENV === 'development'
	const isBuild = process.env.NODE_ENV === undefined || process.env.VERCEL_ENV === undefined

	// ビルド時は安全なデフォルト値を使用してビルドエラーを防ぐ
	if (isBuild) {
		return {
			AUTH_GOOGLE_ID: 'build-placeholder',
			AUTH_GOOGLE_SECRET: 'build-placeholder',
			DATABASE_URL: 'postgresql://localhost:5432/build',
			DIRECT_URL: 'postgresql://localhost:5432/build',
			AUTH_SECRET: 'build-secret-placeholder-32-chars',
			AUTH_URL: 'http://localhost:3000',
			ALLOWED_EMAILS: 'build@example.com',
		}
	}

	// 開発環境では不足している変数にデフォルト値を使用
	if (isDevelopment) {
		return {
			AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || 'dev-google-id',
			AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || 'dev-google-secret',
			DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/dev',
			DIRECT_URL: process.env.DIRECT_URL || 'postgresql://localhost:5432/dev',
			AUTH_SECRET: process.env.AUTH_SECRET || 'dev-secret-key-minimum-32-characters',
			AUTH_URL: process.env.AUTH_URL || 'http://localhost:3000',
			ALLOWED_EMAILS: process.env.ALLOWED_EMAILS || 'dev@example.com',
		}
	}

	// 本番環境では厳格な検証を実行
	const missingVars: string[] = []
	const env: Partial<EnvVars> = {}

	for (const varName of requiredEnvVars) {
		const value = process.env[varName]
		if (!value || value.trim() === '') {
			missingVars.push(varName)
		} else {
			env[varName] = value.trim()
		}
	}

	if (missingVars.length > 0) {
		const errorMessage = `本番環境で必須の環境変数が不足しています: ${missingVars.join(', ')}`
		console.error('🚨 環境変数エラー:')
		console.error(errorMessage)
		console.error('📋 修正方法:')
		console.error('1. デプロイメントプラットフォームで不足している環境変数を設定')
		console.error('2. すべての必須変数が適切に設定されていることを確認')
		console.error('3. アプリケーションを再デプロイ')
		console.error('')
		console.error('不足している変数:', missingVars.join(', '))
		
		throw new Error(errorMessage)
	}

	return env as EnvVars
}

// モジュール読み込み時に環境変数を検証
export const env = validateEnvironmentVariables()

// 他のファイルで使用するための型をエクスポート
export type ValidatedEnv = typeof env
