import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processMemory } from '@/lib/ai/event-categorizer'

// Vercel Cron configuration in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/retry-categorization",
//     "schedule": "* * * * *"  // Every minute
//   }]
// }

export async function GET(request: Request) {
  // Optional: Add security check for Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In production, you should set CRON_SECRET and verify it
    // For now, we'll allow it in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  try {
    const supabase = createAdminClient()
    
    // Find memories that need processing or retry
    // Using exponential backoff based on retry_count
    const now = new Date()
    
    // Get failed memories that are ready for retry
    const { data: failedMemories, error: failedError } = await supabase
      .from('memories')
      .select('id, wedding_id, retry_count, processing_completed_at')
      .eq('status', 'failed')
      .lt('retry_count', 3) // Max 3 retries
      .order('created_at', { ascending: true })
      .limit(10) // Process up to 10 at a time
    
    if (failedError) {
      console.error('Error fetching failed memories:', failedError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    // Filter by exponential backoff timing
    const memoriesToRetry = failedMemories?.filter(memory => {
      if (!memory.processing_completed_at) return true
      
      const lastAttempt = new Date(memory.processing_completed_at)
      const retryCount = memory.retry_count || 0
      
      // Exponential backoff: 1 min, 2 min, 4 min
      const waitMinutes = Math.pow(2, retryCount - 1)
      const nextRetryTime = new Date(lastAttempt.getTime() + waitMinutes * 60 * 1000)
      
      return now >= nextRetryTime
    }) || []
    
    // Also get any old pending memories (stuck for > 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const { data: stuckMemories, error: stuckError } = await supabase
      .from('memories')
      .select('id, wedding_id')
      .eq('status', 'pending')
      .lt('created_at', fiveMinutesAgo.toISOString())
      .limit(5)
    
    if (stuckError) {
      console.error('Error fetching stuck memories:', stuckError)
    }
    
    const allMemoriesToProcess = [
      ...memoriesToRetry.map(m => ({ id: m.id, wedding_id: m.wedding_id })),
      ...(stuckMemories || [])
    ]
    
    // If no memories to process, stop early
    if (allMemoriesToProcess.length === 0) {
      return NextResponse.json({
        message: 'No memories to process',
        processed: 0
      })
    }
    
    // Process memories in parallel (but not too many at once)
    const results = await Promise.allSettled(
      allMemoriesToProcess.map(memory => 
        processMemory(memory.id, memory.wedding_id)
      )
    )
    
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length
    const failureCount = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false)).length
    
    console.log(`Retry cron: Processed ${successCount} successfully, ${failureCount} failed`)
    
    return NextResponse.json({
      message: 'Retry processing complete',
      processed: allMemoriesToProcess.length,
      succeeded: successCount,
      failed: failureCount
    })
    
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: Request) {
  return GET(request)
}