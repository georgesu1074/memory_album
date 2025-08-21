/**
 * Environment variable validation and configuration
 */

// Required environment variables
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = {
  SUPABASE_SERVICE_KEY: '',
  GEMINI_API_KEY: '',
  QDRANT_URL: '',
  QDRANT_API_KEY: '',
  JWT_SECRET: '',
  NODE_ENV: 'development',
} as const

export type RequiredEnvVar = typeof REQUIRED_ENV_VARS[number]
export type OptionalEnvVar = keyof typeof OPTIONAL_ENV_VARS

/**
 * Validate that all required environment variables are set
 */
export function validateEnv(): { 
  valid: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  // Check optional variables and warn if missing
  for (const varName of Object.keys(OPTIONAL_ENV_VARS) as OptionalEnvVar[]) {
    if (!process.env[varName]) {
      warnings.push(`${varName} is not set - some features may not work`)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  }
}

/**
 * Get an environment variable value with type safety
 */
export function getEnvVar(name: RequiredEnvVar): string
export function getEnvVar(name: OptionalEnvVar): string | undefined
export function getEnvVar(name: RequiredEnvVar | OptionalEnvVar): string | undefined {
  return process.env[name]
}

/**
 * Check if a specific service is configured
 */
export function isServiceConfigured(service: 'gemini' | 'qdrant' | 'supabase'): boolean {
  switch (service) {
    case 'gemini':
      return !!process.env.GEMINI_API_KEY
    case 'qdrant':
      return !!process.env.QDRANT_URL && !!process.env.QDRANT_API_KEY
    case 'supabase':
      return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    default:
      return false
  }
}

/**
 * Get configuration for a specific service
 */
export function getServiceConfig(service: 'gemini' | 'qdrant' | 'supabase') {
  switch (service) {
    case 'gemini':
      return {
        apiKey: process.env.GEMINI_API_KEY,
        configured: isServiceConfigured('gemini')
      }
    case 'qdrant':
      return {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        configured: isServiceConfigured('qdrant')
      }
    case 'supabase':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_KEY,
        configured: isServiceConfigured('supabase')
      }
  }
}

/**
 * Initialize and validate environment on startup
 */
export function initializeEnv() {
  const validation = validateEnv()
  
  if (!validation.valid) {
    console.error('❌ Missing required environment variables:', validation.missing)
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${validation.missing.join(', ')}`)
    }
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    validation.warnings.forEach(warning => console.warn(`   - ${warning}`))
  }

  // Log configured services
  console.log('✅ Configured services:')
  if (isServiceConfigured('supabase')) console.log('   - Supabase')
  if (isServiceConfigured('gemini')) console.log('   - Google Gemini')
  if (isServiceConfigured('qdrant')) console.log('   - Qdrant')

  return validation
}