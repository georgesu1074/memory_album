import { Database } from './database'

// Type aliases for cleaner code
export type Wedding = Database['public']['Tables']['weddings']['Row']
export type WeddingInsert = Database['public']['Tables']['weddings']['Insert']
export type WeddingUpdate = Database['public']['Tables']['weddings']['Update']

export type GroomDetails = Database['public']['Tables']['groom_details']['Row']
export type GroomDetailsInsert = Database['public']['Tables']['groom_details']['Insert']
export type GroomDetailsUpdate = Database['public']['Tables']['groom_details']['Update']

export type BrideDetails = Database['public']['Tables']['bride_details']['Row']
export type BrideDetailsInsert = Database['public']['Tables']['bride_details']['Insert']
export type BrideDetailsUpdate = Database['public']['Tables']['bride_details']['Update']

// Wedding with joined details
export interface WeddingWithDetails extends Wedding {
  groom?: GroomDetails | null
  bride?: BrideDetails | null
}

// Helper functions for getting display names
export function getGroomDisplayName(wedding: WeddingWithDetails): string {
  const displayName = wedding.groom?.display_name || wedding.groom?.name || 'Groom'
  // Return only the first name
  return displayName.split(' ')[0]
}

export function getBrideDisplayName(wedding: WeddingWithDetails): string {
  const displayName = wedding.bride?.display_name || wedding.bride?.name || 'Bride'
  // Return only the first name
  return displayName.split(' ')[0]
}

export function getCoupleNames(wedding: WeddingWithDetails): string {
  const groomFirstName = getGroomDisplayName(wedding)
  const brideFirstName = getBrideDisplayName(wedding)
  return `${brideFirstName} & ${groomFirstName}`
}