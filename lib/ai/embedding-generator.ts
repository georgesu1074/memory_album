import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiClient } from './gemini'
import { getQdrantClient } from '@/lib/qdrant/client'

// Gemini embedding model (free!)
const EMBEDDING_MODEL = 'text-embedding-004'
const EMBEDDING_DIMENSION = 768

export interface EmbeddingMetadata {
  wedding_id: string
  memory_id: string
  memory_type: 'bride' | 'groom' | 'both'
  category: string | null
  guest_name: string | null
  created_at: string
  keywords?: string[]
}

/**
 * Generate embedding for a memory using Gemini's free embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const client = getGeminiClient()
    const model = client.getGenerativeModel({ model: EMBEDDING_MODEL })
    
    // Gemini's embedding API
    const result = await model.embedContent(text)
    const embedding = result.embedding
    
    if (!embedding || !embedding.values) {
      throw new Error('No embedding returned from Gemini')
    }
    
    return embedding.values
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Store embedding in Qdrant
 */
export async function storeEmbedding(
  memoryId: string,
  embedding: number[],
  metadata: EmbeddingMetadata
): Promise<boolean> {
  try {
    const qdrant = await getQdrantClient()
    
    // Collection name includes wedding_id for isolation
    const collectionName = `wedding-${metadata.wedding_id}`
    
    // Check if collection exists, create if not
    try {
      await qdrant.getCollection(collectionName)
    } catch {
      // Collection doesn't exist, create it
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: EMBEDDING_DIMENSION,
          distance: 'Cosine'
        }
      })
    }
    
    // Store the embedding with metadata
    await qdrant.upsert(collectionName, {
      points: [
        {
          id: memoryId, // Use memory ID as point ID
          vector: embedding,
          payload: metadata as unknown as Record<string, unknown>
        }
      ]
    })
    
    return true
  } catch (error) {
    console.error('Error storing embedding in Qdrant:', error)
    return false
  }
}

/**
 * Generate and store embedding for a memory
 */
export async function processMemoryEmbedding(
  memoryId: string,
  memoryText: string,
  metadata: EmbeddingMetadata
): Promise<boolean> {
  try {
    // Enrich the text with context before embedding
    // This makes the embedding more semantically meaningful
    const enrichedText = `Category: ${metadata.category}. Guest: ${metadata.guest_name}. Memory about ${metadata.memory_type}: ${memoryText}`
    
    // Generate embedding of the enriched text
    const embedding = await generateEmbedding(enrichedText)
    
    // Store in Qdrant
    const stored = await storeEmbedding(memoryId, embedding, metadata)
    
    if (!stored) {
      throw new Error('Failed to store embedding')
    }
    
    // TODO: Update memory_embeddings table to track that we've stored it
    // This would help with recovery/retries
    
    return true
  } catch (error) {
    console.error('Error processing memory embedding:', error)
    return false
  }
}

/**
 * Search for similar memories (for Phase 2 - RAG features)
 * Keeping this here for future use
 */
export async function searchSimilarMemories(
  weddingId: string,
  queryText: string,
  limit: number = 5
): Promise<Array<{ id: string; score: number; metadata: EmbeddingMetadata }>> {
  try {
    const qdrant = await getQdrantClient()
    const collectionName = `wedding-${weddingId}`
    
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(queryText)
    
    // Search in Qdrant
    const searchResult = await qdrant.search(collectionName, {
      vector: queryEmbedding,
      limit,
      with_payload: true
    })
    
    return searchResult.map(result => ({
      id: result.id as string,
      score: result.score,
      metadata: result.payload as unknown as EmbeddingMetadata
    }))
  } catch (error) {
    console.error('Error searching memories:', error)
    return []
  }
}