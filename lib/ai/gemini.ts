import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini model configuration
export const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash', // Fast and cheap model
  temperature: 0.7,
  maxOutputTokens: 1000,
  topP: 0.95,
  topK: 40,
} as const

// Initialize Gemini client
let geminiClient: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }

  return geminiClient
}

// Category types for memories
export interface MemoryCategory {
  category: string
  confidence: number
  keywords: string[]
}

/**
 * Categorize a memory using Gemini
 */
export async function categorizeMemory(
  memoryText: string,
  memoryType: 'bride' | 'groom' | 'both'
): Promise<MemoryCategory> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ 
      model: GEMINI_CONFIG.model,
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
        topP: GEMINI_CONFIG.topP,
        topK: GEMINI_CONFIG.topK,
        responseMimeType: 'application/json',
      }
    })

    const prompt = `
You are categorizing wedding memories. Analyze this memory and return a JSON response.

Memory: "${memoryText}"
Memory Type: ${memoryType}

Categorize this memory into one of these categories:
- childhood-stories (stories from when they were young)
- how-they-met (stories about the couple meeting)
- funny-moments (humorous memories)
- romantic-memories (romantic stories)
- friendship-memories (stories about friendship)
- family-memories (family-related stories)
- advice-wishes (marriage advice or well wishes)
- school-memories (school/college stories)
- work-memories (work-related stories)
- travel-adventures (travel stories)
- milestone-moments (important life moments)
- general-memories (doesn't fit other categories)

Return JSON in this exact format:
{
  "category": "category-name-here",
  "confidence": 0.85,
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

The confidence should be between 0 and 1.
Extract 3-5 relevant keywords from the memory.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    try {
      const parsed = JSON.parse(text)
      return {
        category: parsed.category || 'general-memories',
        confidence: parsed.confidence || 0.5,
        keywords: parsed.keywords || []
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text)
      return {
        category: 'general-memories',
        confidence: 0.3,
        keywords: []
      }
    }
  } catch (error) {
    console.error('Gemini categorization error:', error)
    throw new Error('Failed to categorize memory')
  }
}

/**
 * Generate a summary for a group of memories
 */
export async function generateGroupSummary(
  memories: string[],
  category: string,
  coupleNames: string
): Promise<string> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ 
      model: GEMINI_CONFIG.model,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 200,
      }
    })

    const sentenceGuidance = memories.length === 1 
      ? "1-2 sentences" 
      : `2-${Math.min(memories.length + 1, 5)} sentences`

    const prompt = `
Write a ${sentenceGuidance} story summary of "${category}" for ${coupleNames}'s wedding album.
Combine these guest perspectives into a heartwarming narrative with ${coupleNames} as the main characters.

${memories.length === 1 ? 'Guest memory' : 'Guest memories'}:
${memories.map((m, i) => `${memories.length > 1 ? `${i + 1}. ` : ''}${m}`).join('\n')}

Summary:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Gemini summary generation error:', error)
    throw new Error('Failed to generate summary')
  }
}

/**
 * Check for inappropriate content
 */
export async function moderateContent(text: string): Promise<{
  safe: boolean
  reason?: string
}> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ 
      model: GEMINI_CONFIG.model,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
        responseMimeType: 'application/json',
      }
    })

    const prompt = `
Check if this wedding memory contains inappropriate content.
Look for: profanity, explicit content, hate speech, or anything inappropriate for a wedding.

Text: "${text}"

Return JSON:
{
  "safe": true/false,
  "reason": "reason if unsafe, or null if safe"
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const parsed = JSON.parse(response.text())
    
    return {
      safe: parsed.safe !== false, // Default to safe if parsing fails
      reason: parsed.reason || undefined
    }
  } catch (error) {
    console.error('Content moderation error:', error)
    // Default to safe on error to not block users
    return { safe: true }
  }
}

/**
 * Health check for Gemini API
 */
export async function checkGeminiHealth(): Promise<{
  healthy: boolean
  error?: string
}> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ model: GEMINI_CONFIG.model })
    
    // Simple test prompt
    const result = await model.generateContent('Say "OK"')
    const response = await result.response
    const text = response.text()
    
    return {
      healthy: text.toLowerCase().includes('ok'),
      error: text.toLowerCase().includes('ok') ? undefined : 'Unexpected response'
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}