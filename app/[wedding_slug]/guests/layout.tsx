import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkWeddingAccess } from '@/lib/auth/ownership'

export default async function GuestsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ wedding_slug: string }>
}) {
  const { wedding_slug } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/auth/login?redirect=/${wedding_slug}/guests`)
  }
  
  // Check if user owns this wedding or is admin
  const { hasAccess } = await checkWeddingAccess(user.id, wedding_slug)
  
  if (!hasAccess) {
    // Redirect to dashboard with error message
    redirect('/dashboard?error=unauthorized')
  }
  
  return <>{children}</>
}