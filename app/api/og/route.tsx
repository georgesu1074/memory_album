import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCoupleNames } from '@/types/wedding'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const weddingSlug = searchParams.get('wedding')

    if (!weddingSlug) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontFamily: 'system-ui',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1 style={{ fontSize: 72, color: 'white', margin: 0 }}>Memory Album</h1>
              <p style={{ fontSize: 32, color: 'white', opacity: 0.9 }}>Share Your Wedding Memories</p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      )
    }

    // Fetch wedding data
    const supabaseAdmin = createAdminClient()
    const { data: wedding } = await supabaseAdmin
      .from('weddings')
      .select(`
        *,
        bride:bride_details!weddings_bride_id_fkey(*),
        groom:groom_details!weddings_groom_id_fkey(*)
      `)
      .eq('slug', weddingSlug)
      .single()

    if (!wedding) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              fontFamily: 'system-ui',
            }}
          >
            <h1 style={{ fontSize: 48, color: '#374151' }}>Wedding Not Found</h1>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      )
    }

    const coupleNames = getCoupleNames(wedding)
    const themeColor = wedding.theme_color || '#8B5CF6'
    const secondaryColor = wedding.secondary_color || '#EC4899'
    
    // Format wedding date
    const weddingDate = wedding.wedding_date 
      ? new Date(wedding.wedding_date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(135deg, ${themeColor}20 0%, ${secondaryColor}20 100%)`,
            backgroundColor: 'white',
            fontFamily: 'system-ui',
            position: 'relative',
          }}
        >
          {/* Decorative hearts */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 40,
              fontSize: 120,
              opacity: 0.1,
              color: themeColor,
            }}
          >
            ♥
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 40,
              fontSize: 120,
              opacity: 0.1,
              color: secondaryColor,
            }}
          >
            ♥
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '60px',
            }}
          >
            {/* Couple names */}
            <h1
              style={{
                fontSize: 84,
                fontWeight: 'bold',
                color: '#111827',
                margin: 0,
                marginBottom: 20,
                letterSpacing: '-1px',
              }}
            >
              {coupleNames}
            </h1>

            {/* Wedding date */}
            {weddingDate && (
              <p
                style={{
                  fontSize: 36,
                  color: themeColor,
                  margin: 0,
                  marginBottom: 30,
                  fontWeight: 500,
                }}
              >
                {weddingDate}
              </p>
            )}

            {/* Tagline */}
            <p
              style={{
                fontSize: 28,
                color: '#6B7280',
                margin: 0,
                maxWidth: '800px',
              }}
            >
              Share your favorite memories from our special day
            </p>

            {/* Website */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 40,
                fontSize: 24,
                color: '#9CA3AF',
              }}
            >
              <span>memoryalbum.ai</span>
              <span style={{ margin: '0 15px' }}>•</span>
              <span>{weddingSlug}</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}