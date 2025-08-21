// Types for AI categorization

export type MemoryStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'failed_permanent'

export interface CategorizationMetadata {
  confidence: number
  keywords: string[]
  matched_with?: string[] // IDs of other memories in same category
  reasoning?: string
  attempt_count: number
  categorized_at: string
  processing_time_ms?: number
}

export interface CategoryInfo {
  category: string
  count: number
}

export interface MemoryExample {
  id: string
  text: string
  guest_name: string | null
}