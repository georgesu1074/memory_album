import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiClient, GEMINI_CONFIG } from './gemini'
import { createAdminClient } from '@/lib/supabase/admin'
import { CategoryInfo, MemoryExample, CategorizationMetadata } from '@/types/categorization'
import { processMemoryEmbedding, EmbeddingMetadata } from './embedding-generator'
import { findOrCreateCategory, updateCategorySummary } from '@/lib/db/categories'

// Tool function declarations for Gemini
const tools = [{
  functionDeclarations: [
    {
      name: 'get_existing_categories',
      description: 'Get all existing memory categories and their counts',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'get_memories_in_category',
      description: 'Get example memories from a specific category to understand context',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'The category name to get examples from'
          }
        },
        required: ['category']
      }
    }
  ]
}]

// Tool implementation functions
async function getExistingCategories(weddingId: string): Promise<CategoryInfo[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('name, memory_count')
    .eq('wedding_id', weddingId)
    .order('memory_count', { ascending: false })
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return data.map(cat => ({
    category: cat.name,
    count: cat.memory_count
  }))
}

async function getMemoriesInCategory(
  weddingId: string, 
  categoryName: string, 
  limit: number = 3
): Promise<MemoryExample[]> {
  const supabase = createAdminClient()
  
  // First get the category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('wedding_id', weddingId)
    .eq('name', categoryName)
    .single()
  
  if (!category) {
    return []
  }
  
  const { data, error } = await supabase
    .from('memories')
    .select('id, memory_text, guest_name')
    .eq('wedding_id', weddingId)
    .eq('category_id', category.id)
    .limit(limit)
  
  if (error) {
    console.error('Error fetching category memories:', error)
    return []
  }
  
  return data.map(m => ({
    id: m.id,
    text: m.memory_text,
    guest_name: m.guest_name
  }))
}

// Main categorization function
export async function categorizeMemory(
  memoryId: string,
  weddingId: string,
  memoryText: string,
  memoryType: 'bride' | 'groom' | 'both',
  guestName: string | null
): Promise<{
  category: string
  confidence: number
  metadata: CategorizationMetadata
}> {
  const startTime = Date.now()
  
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: GEMINI_CONFIG.model,
      tools,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    })
    
    // Get existing categories for context
    const existingCategories = await getExistingCategories(weddingId)
    
    const prompt = `
You are categorizing wedding memories to group together different perspectives of the same events.

GOAL: Identify when people are talking about the SAME SPECIFIC event, trip, or experience.

Current memory to categorize:
Guest: ${guestName || 'Anonymous'}
Related to: ${memoryType}
Memory: "${memoryText}"

Existing categories (${existingCategories.length} total):
${existingCategories.map(c => `- "${c.category}" (${c.count} memories)`).join('\n') || 'No categories yet'}

GOOD Categories (Specific Events):
- "Spring Break 2019 Cancun Trip"
- "The Halloween Party Where John Dressed as a Dinosaur"
- "Weekly D&D Campaign at Mike's House"
- "The Proposal at Sunset Beach"
- "Sarah and Tom's First Date at the Coffee Shop"

BAD Categories (Too Generic):
- "College Memories"
- "Funny Times"
- "Travel Stories"
- "Happy Moments"

Instructions:
1. First check if this memory matches any existing category
2. If unsure, use get_memories_in_category to see examples
3. Look for specific details: dates, locations, people, unique events
4. Create NEW category if this is a distinct event not yet captured
5. Category names should be specific and descriptive (15-50 characters)
6. Focus on the EVENT, not the emotion or type of memory

After analysis, respond with a JSON object:
{
  "category": "The specific event category name",
  "confidence": 0.85,
  "keywords": ["key", "identifying", "words"],
  "reasoning": "Brief explanation of categorization decision",
  "matches_existing": true/false
}
`
    
    const chat = model.startChat()
    const result = await chat.sendMessage(prompt)
    
    // Handle tool calls if the model wants to explore categories
    let functionCalls = result.response.functionCalls()
    let toolResponses = []
    
    while (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        let response: any
        
        if (call.name === 'get_existing_categories') {
          response = await getExistingCategories(weddingId)
        } else if (call.name === 'get_memories_in_category') {
          const category = call.args?.category as string
          response = await getMemoriesInCategory(weddingId, category)
        }
        
        toolResponses.push({
          functionResponse: {
            name: call.name,
            response: {
              result: response
            }
          }
        })
      }
      
      // Send tool responses back to continue the conversation
      const nextResult = await chat.sendMessage(toolResponses)
      functionCalls = nextResult.response.functionCalls()
      toolResponses = []
    }
    
    // Get the final response
    const finalText = result.response.text()
    
    // Extract JSON from response
    const jsonMatch = finalText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    // Find other memories in the same category if it's an existing one
    let matchedWith: string[] = []
    if (parsed.matches_existing && parsed.category) {
      const supabase = createAdminClient()
      
      // First get the category ID
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('wedding_id', weddingId)
        .eq('name', parsed.category)
        .single()
      
      if (category) {
        const { data } = await supabase
          .from('memories')
          .select('id')
          .eq('wedding_id', weddingId)
          .eq('category_id', category.id)
          .neq('id', memoryId)
          .limit(5)
        
        matchedWith = data?.map(m => m.id) || []
      }
    }
    
    const processingTime = Date.now() - startTime
    
    return {
      category: parsed.category || 'Uncategorized Memories',
      confidence: parsed.confidence || 0.5,
      metadata: {
        confidence: parsed.confidence || 0.5,
        keywords: parsed.keywords || [],
        matched_with: matchedWith,
        reasoning: parsed.reasoning,
        attempt_count: 1,
        categorized_at: new Date().toISOString(),
        processing_time_ms: processingTime
      }
    }
  } catch (error) {
    console.error('Categorization error:', error)
    
    // Fallback categorization
    return {
      category: 'Uncategorized Memories',
      confidence: 0.1,
      metadata: {
        confidence: 0.1,
        keywords: [],
        reasoning: 'Failed to categorize: ' + (error as Error).message,
        attempt_count: 1,
        categorized_at: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime
      }
    }
  }
}

// Process a memory (updates database)
export async function processMemory(
  memoryId: string,
  weddingId: string
): Promise<boolean> {
  console.log(`[PROCESS] Starting processing for memory ${memoryId}`)
  const supabase = createAdminClient()
  
  try {
    // Mark as processing
    await supabase
      .from('memories')
      .update({ 
        status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('id', memoryId)
    
    // Get memory details
    const { data: memory, error } = await supabase
      .from('memories')
      .select('memory_text, memory_type, guest_name, retry_count')
      .eq('id', memoryId)
      .single()
    
    if (error || !memory) {
      throw new Error('Memory not found')
    }
    
    // Categorize the memory
    console.log(`[PROCESS] Categorizing: "${memory.memory_text.substring(0, 50)}..."`)
    const result = await categorizeMemory(
      memoryId,
      weddingId,
      memory.memory_text,
      memory.memory_type as 'bride' | 'groom' | 'both',
      memory.guest_name
    )
    console.log(`[PROCESS] Category assigned: "${result.category}" with confidence ${result.confidence}`)
    
    // Find or create the category
    const category = await findOrCreateCategory(
      weddingId,
      result.category,
      result.metadata.keywords,
      result.metadata.keywords?.[0] // Use first keyword as theme for now
    )
    console.log(`[PROCESS] Category record: ${category.id}`)
    
    // Update memory with category ID and results
    const { error: updateError } = await supabase
      .from('memories')
      .update({
        category: result.category, // Keep the name for backwards compatibility
        category_id: category.id, // Add the new category reference
        category_confidence: result.confidence,
        categorization_metadata: {
          ...result.metadata,
          attempt_count: (memory.retry_count || 0) + 1
        },
        status: 'completed',
        processing_completed_at: new Date().toISOString(),
        processing_error: null
      })
      .eq('id', memoryId)
    
    if (updateError) {
      throw updateError
    }
    
    // Update category summary after successful categorization
    try {
      await updateCategorySummary(category.id, weddingId, result.category)
      console.log(`[PROCESS] Category summary updated for "${result.category}"`)
    } catch (summaryError) {
      console.error('Failed to update category summary:', summaryError)
      // Don't fail the whole process if summary fails
    }
    
    // Generate and store embedding (don't fail if this fails)
    try {
      const embeddingMetadata: EmbeddingMetadata = {
        wedding_id: weddingId,
        memory_id: memoryId,
        memory_type: memory.memory_type as 'bride' | 'groom' | 'both',
        category: result.category,
        guest_name: memory.guest_name,
        created_at: new Date().toISOString(),
        keywords: result.metadata.keywords
      }
      
      await processMemoryEmbedding(memoryId, memory.memory_text, embeddingMetadata)
    } catch (embeddingError) {
      console.error('Failed to generate embedding:', embeddingError)
      // Don't fail the categorization if embedding fails
    }
    
    return true
  } catch (error) {
    console.error('Error processing memory:', error)
    
    // Mark as failed
    const { data: memory } = await supabase
      .from('memories')
      .select('retry_count')
      .eq('id', memoryId)
      .single()
    
    const retryCount = (memory?.retry_count || 0) + 1
    const status = retryCount >= 3 ? 'failed_permanent' : 'failed'
    
    await supabase
      .from('memories')
      .update({
        status,
        retry_count: retryCount,
        processing_error: (error as Error).message,
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', memoryId)
    
    return false
  }
}