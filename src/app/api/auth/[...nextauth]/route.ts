import { handlers } from '@/lib/auth'
import { validateRuntimeEnvironment } from '@/lib/runtime-env-check'

// Validate environment variables at first API call
validateRuntimeEnvironment()

export const { GET, POST } = handlers
