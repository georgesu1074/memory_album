import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Updates a category's memory_type based on all its memories
 * Business logic:
 * - All bride → 'bride'
 * - All groom → 'groom'
 * - Mixed or any 'both' → 'both'
 */
export async function updateCategoryMemoryType(categoryId: string): Promise<void> {
  const supabase = createAdminClient()
  
  try {
    // Get all memories for this category
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('memory_type')
      .eq('category_id', categoryId)
    
    if (memoriesError) {
      console.error('Error fetching memories for category:', memoriesError)
      throw memoriesError
    }
    
    // If no memories, default to 'both'
    if (!memories || memories.length === 0) {
      await supabase
        .from('categories')
        .update({ memory_type: 'both' })
        .eq('id', categoryId)
      return
    }
    
    // Determine the category's memory_type
    const memoryTypes = memories.map(m => m.memory_type).filter(Boolean)
    
    let categoryMemoryType: 'bride' | 'groom' | 'both' = 'both'
    
    if (memoryTypes.includes('both')) {
      // If any memory is 'both', category is 'both'
      categoryMemoryType = 'both'
    } else if (memoryTypes.includes('bride') && memoryTypes.includes('groom')) {
      // If there are both bride and groom memories, category is 'both'
      categoryMemoryType = 'both'
    } else if (memoryTypes.every(type => type === 'bride')) {
      // All memories are bride
      categoryMemoryType = 'bride'
    } else if (memoryTypes.every(type => type === 'groom')) {
      // All memories are groom
      categoryMemoryType = 'groom'
    }
    
    // Update the category
    const { error: updateError } = await supabase
      .from('categories')
      .update({ 
        memory_type: categoryMemoryType,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
    
    if (updateError) {
      console.error('Error updating category memory_type:', updateError)
      throw updateError
    }
    
    console.log(`Updated category ${categoryId} memory_type to: ${categoryMemoryType}`)
  } catch (error) {
    console.error('Failed to update category memory_type:', error)
    // Don't throw - this shouldn't break the main flow
  }
}