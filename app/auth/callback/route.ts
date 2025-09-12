import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user data to ensure profile is created
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user profile exists, create if not
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()
        
        if (!profile) {
          // Create user profile
          await supabase.from('users').insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          })
        }
      }
      
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}