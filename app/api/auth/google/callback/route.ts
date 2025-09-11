import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'

  // Handle errors from Google
  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}?error=oauth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}?error=invalid_request`)
  }

  try {
    // Decode state to get wedding slug
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { weddingSlug } = stateData

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokens

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()

    // Get wedding ID from slug
    const supabase = createAdminClient()
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('slug', weddingSlug)
      .single()

    if (!wedding) {
      throw new Error('Wedding not found')
    }

    // Store tokens in database
    const driveData = {
      wedding_id: wedding.id,
      google_email: userInfo.email,
      google_name: userInfo.name,
      access_token: access_token,
      refresh_token: refresh_token,
      token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      is_active: true
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('wedding_google_drive')
      .select('id')
      .eq('wedding_id', wedding.id)
      .single()

    if (existing) {
      // Update existing record
      await supabase
        .from('wedding_google_drive')
        .update(driveData)
        .eq('wedding_id', wedding.id)
    } else {
      // Insert new record
      await supabase
        .from('wedding_google_drive')
        .insert(driveData)
    }

    // Redirect back to config with success
    return NextResponse.redirect(`${baseUrl}/${weddingSlug}/config?success=google_connected`)
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${baseUrl}?error=oauth_failed`)
  }
}