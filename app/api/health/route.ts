import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { checkGeminiHealth } from '@/lib/ai/gemini'
import { checkQdrantHealth } from '@/lib/vector/qdrant'
import { isServiceConfigured } from '@/lib/config/env'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: { configured: false, healthy: false, error: null as string | null },
      gemini: { configured: false, healthy: false, error: null as string | null },
      qdrant: { configured: false, healthy: false, error: null as string | null },
    }
  }

  // Check Supabase
  if (isServiceConfigured('supabase')) {
    health.services.supabase.configured = true
    try {
      const { error } = await supabase.from('weddings').select('id').limit(1)
      health.services.supabase.healthy = !error
      if (error) health.services.supabase.error = error.message
    } catch (e) {
      health.services.supabase.healthy = false
      health.services.supabase.error = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  // Check Gemini
  if (isServiceConfigured('gemini')) {
    health.services.gemini.configured = true
    try {
      const geminiHealth = await checkGeminiHealth()
      health.services.gemini.healthy = geminiHealth.healthy
      if (geminiHealth.error) health.services.gemini.error = geminiHealth.error
    } catch (e) {
      health.services.gemini.healthy = false
      health.services.gemini.error = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  // Check Qdrant
  if (isServiceConfigured('qdrant')) {
    health.services.qdrant.configured = true
    try {
      const qdrantHealth = await checkQdrantHealth()
      health.services.qdrant.healthy = qdrantHealth.healthy
      if (qdrantHealth.error) {
        health.services.qdrant.error = qdrantHealth.error
      }
    } catch (e) {
      health.services.qdrant.healthy = false
      health.services.qdrant.error = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  // Overall health status
  const anyUnhealthy = Object.values(health.services).some(
    service => service.configured && !service.healthy
  )
  
  if (anyUnhealthy) {
    health.status = 'degraded'
  }

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  })
}