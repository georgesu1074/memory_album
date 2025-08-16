import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    // Test public client connection
    const { data: publicTest, error: publicError } = await supabase
      .from('weddings')
      .select('count')
      .limit(1)

    if (publicError && !publicError.message.includes('no rows')) {
      return NextResponse.json({
        success: false,
        error: 'Public client connection failed',
        details: publicError.message,
      }, { status: 500 })
    }

    // Test admin client connection
    const adminClient = createAdminClient()
    const { data: adminTest, error: adminError } = await adminClient
      .from('weddings')
      .select('count')
      .limit(1)

    if (adminError && !adminError.message.includes('no rows')) {
      return NextResponse.json({
        success: false,
        error: 'Admin client connection failed',
        details: adminError.message,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      environment: {
        hasPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      },
      database: {
        publicAccess: !publicError || publicError.message.includes('no rows'),
        adminAccess: !adminError || adminError.message.includes('no rows'),
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}