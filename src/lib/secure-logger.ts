/**
 * セキュアログユーティリティ - 本番環境での機密情報漏洩を防止
 * 本番ビルドでは、console.*文はbabelによって自動的に除去される
 */

const isDevelopment = process.env.NODE_ENV === 'development'

// ログレベル定義
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  category: string
  message: string
  data?: any
  timestamp: string
}

// 本番環境で自動除去されるロガーを作成
const createLogger = (category: string) => ({
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`[${category.toUpperCase()}] ${message}`, data)
    }
  },
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[${category.toUpperCase()}] ${message}`, data)
    }
  },
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[${category.toUpperCase()}] ${message}`, data)
    }
  },
  error: (message: string, error?: any) => {
    // 重要なエラーは本番でも保持（babel除去対象外）
    if (isDevelopment) {
      console.error(`[${category.toUpperCase()} ERROR] ${message}`, error)
    } else {
      console.error(`[${category.toUpperCase()} ERROR] ${message}`)
    }
  },
  trace: (message: string, data?: any) => {
    if (isDevelopment) {
      console.trace(`[${category.toUpperCase()}] ${message}`, data)
    }
  }
})

export const logger = {
  // 認証関連ログ
  auth: createLogger('auth'),
  
  // 一般アプリケーションログ
  app: createLogger('app'),
  
  // APIログ
  api: createLogger('api'),
  
  // データベースログ
  db: createLogger('db'),
  
  // UIコンポーネントログ
  ui: createLogger('ui'),
  
  // Redux/状態管理ログ
  state: createLogger('state'),
  
  // パフォーマンスログ
  perf: createLogger('perf'),
  
  // 外部APIログ（Google Drive等）
  external: createLogger('external'),
  
  // ブラウザ拡張機能ログ
  extension: createLogger('extension'),
  
  // ドラッグ&ドロップログ
  dnd: createLogger('dnd')
}

// 後方互換性のため既存のsecureLoggerを維持
export const secureLogger = {
  auth: logger.auth,
  app: logger.app
}