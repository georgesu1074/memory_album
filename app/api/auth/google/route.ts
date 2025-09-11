import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const weddingSlug = searchParams.get('wedding')
  
  if (!weddingSlug) {
    return NextResponse.json({ error: 'Wedding slug required' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
  }

  // Determine redirect URI based on environment
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
  const redirectUri = `${baseUrl}/api/auth/google/callback`

  // Create state parameter with wedding slug
  const state = Buffer.from(JSON.stringify({
    weddingSlug: weddingSlug
  })).toString('base64')

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent',
    state: state
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return NextResponse.redirect(authUrl)
}