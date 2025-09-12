import { createClient } from '@/lib/supabase/server'

/**
 * Check if a user owns a wedding or is an admin
 */
export async function checkWeddingAccess(
  userId: string,
  weddingSlug: string
): Promise<{ hasAccess: boolean; isOwner: boolean; isAdmin: boolean; wedding?: any }> {
  const supabase = await createClient()
  
  // Get wedding
  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('slug', weddingSlug)
    .single()
  
  if (!wedding) {
    return { hasAccess: false, isOwner: false, isAdmin: false }
  }
  
  // Check if user is admin
  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()
  
  const isAdmin = user?.is_admin || false
  
  // Check if user owns the wedding
  const { data: ownership } = await supabase
    .from('wedding_owners')
    .select('id')
    .eq('wedding_id', wedding.id)
    .eq('user_id', userId)
    .single()
  
  const isOwner = !!ownership
  const hasAccess = isAdmin || isOwner
  
  return { hasAccess, isOwner, isAdmin, wedding }
}

/**
 * Get all weddings a user owns
 */
export async function getUserWeddings(userId: string) {
  const supabase = await createClient()
  
  const { data: ownedWeddings } = await supabase
    .from('wedding_owners')
    .select(`
      wedding_id,
      weddings (
        *,
        bride:bride_details!weddings_bride_id_fkey(*),
        groom:groom_details!weddings_groom_id_fkey(*)
      )
    `)
    .eq('user_id', userId)
  
  return ownedWeddings?.map(ow => ow.weddings).filter(Boolean) || []
}

/**
 * Add a user as owner of a wedding
 */
export async function addWeddingOwner(
  weddingId: string,
  userEmail: string,
  grantedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Find user by email
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .single()
  
  if (!user) {
    return { success: false, error: 'User not found' }
  }
  
  // Add as owner
  const { error } = await supabase
    .from('wedding_owners')
    .insert({
      wedding_id: weddingId,
      user_id: user.id,
      granted_by: grantedBy
    })
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return { success: false, error: 'User is already an owner' }
    }
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Remove a user as owner of a wedding
 */
export async function removeWeddingOwner(
  weddingId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('wedding_owners')
    .delete()
    .eq('wedding_id', weddingId)
    .eq('user_id', userId)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}