import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Check if the current user is the owner of a wedding
 * This is a simple implementation - in production, you'd want proper JWT auth
 */
export async function checkWeddingOwner(weddingSlug: string): Promise<{
  isOwner: boolean;
  wedding?: any;
}> {
  try {
    // Get the owner token from cookies
    const cookieStore = cookies();
    const ownerToken = cookieStore.get(`wedding-owner-${weddingSlug}`);
    
    if (!ownerToken) {
      return { isOwner: false };
    }

    // Verify the token matches the wedding's owner token
    const supabaseAdmin = createAdminClient();
    const { data: wedding } = await supabaseAdmin
      .from('weddings')
      .select(`
        *,
        bride:bride_details!weddings_bride_id_fkey(*),
        groom:groom_details!weddings_groom_id_fkey(*)
      `)
      .eq('slug', weddingSlug)
      .single();

    if (!wedding) {
      return { isOwner: false };
    }

    // For MVP, we're using a simple token stored in cookies
    // In production, use proper JWT with bride/groom email verification
    const expectedToken = `owner-${wedding.id}-${wedding.created_at}`;
    
    if (ownerToken.value === expectedToken) {
      return { isOwner: true, wedding };
    }

    return { isOwner: false, wedding };
  } catch (error) {
    console.error('Error checking wedding owner:', error);
    return { isOwner: false };
  }
}

/**
 * Set owner cookie when wedding is created
 */
export function setWeddingOwnerCookie(weddingSlug: string, weddingId: string, createdAt: string): string {
  const token = `owner-${weddingId}-${createdAt}`;
  // This would be set in the response headers
  return token;
}