import { createAdminClient } from '@/lib/supabase/admin'
import { generateGroupSummary } from '@/lib/ai/gemini'

export interface Category {
  id: string
  wedding_id: string
  name: string
  summary: string | null
  memory_count: number
  keywords: string[]
  theme: string | null
  created_at: string
  updated_at: string
}

/**
 * Find or create a category for a wedding
 */
export async function findOrCreateCategory(
  weddingId: string,
  categoryName: string,
  keywords: string[] = [],
  theme?: string
): Promise<Category> {
  const supabase = createAdminClient()
  
  // First, try to find existing category
  const { data: existing } = await supabase
    .from('categories')
    .select('*')
    .eq('wedding_id', weddingId)
    .eq('name', categoryName)
    .single()
  
  if (existing) {
    return existing as Category
  }
  
  // Create new category
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      wedding_id: weddingId,
      name: categoryName,
      keywords: keywords,
      theme: theme,
      memory_count: 0
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create category: ${error.message}`)
  }
  
  return newCategory as Category
}

/**
 * Update category summary with all memories
 */
export async function updateCategorySummary(
  categoryId: string,
  weddingId: string,
  categoryName: string
): Promise<void> {
  const supabase = createAdminClient()
  
  // First increment the count
  await incrementCategoryCount(categoryId)
  
  // Get all memories in this category
  const { data: memories, error: memoriesError } = await supabase
    .from('memories')
    .select('memory_text, guest_name')
    .eq('wedding_id', weddingId)
    .eq('category_id', categoryId)
    .eq('status', 'completed')
    .order('created_at', { ascending: true })
  
  if (memoriesError || !memories || memories.length < 2) {
    // Don't generate summary for single memory, but count was still incremented
    return
  }
  
  try {
    // Generate summary combining all perspectives
    const memoryTexts = memories.map(m => 
      `${m.guest_name}: "${m.memory_text}"`
    )
    
    const summary = await generateGroupSummary(
      memoryTexts,
      categoryName
    )
    
    // Update category with summary and count
    await supabase
      .from('categories')
      .update({
        summary: summary,
        memory_count: memories.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
    
    console.log(`[CATEGORY] Updated summary for "${categoryName}" with ${memories.length} memories`)
  } catch (error) {
    console.error('Failed to generate category summary:', error)
    // Don't fail the whole process if summary generation fails
  }
}

/**
 * Increment memory count for a category
 */
export async function incrementCategoryCount(categoryId: string): Promise<void> {
  const supabase = createAdminClient()
  
  // Use Postgres to atomically increment
  const { error } = await supabase.rpc('increment_category_count', {
    category_id: categoryId
  })
  
  if (error) {
    console.error('Failed to increment category count:', error)
  }
}

/**
 * Get all categories for a wedding
 */
export async function getWeddingCategories(weddingId: string): Promise<Category[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('memory_count', { ascending: false })
  
  if (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
  
  return data as Category[]
}