import { QdrantClient } from '@qdrant/js-client-rest'

// Qdrant configuration
export const QDRANT_CONFIG = {
  collectionName: 'wedding_memories',
  vectorSize: 768, // Gemini embedding size
  distance: 'Cosine' as const,
} as const

// Initialize Qdrant client
let qdrantClient: QdrantClient | null = null

export function getQdrantClient(): QdrantClient {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    throw new Error('QDRANT_URL and QDRANT_API_KEY environment variables are required')
  }

  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    })
  }

  return qdrantClient
}

/**
 * Initialize Qdrant collection for wedding memories
 */
export async function initializeCollection(weddingId?: string): Promise<void> {
  const client = getQdrantClient()
  const collectionName = weddingId 
    ? `${QDRANT_CONFIG.collectionName}_${weddingId}`
    : QDRANT_CONFIG.collectionName

  try {
    // Check if collection exists
    const collections = await client.getCollections()
    const exists = collections.collections.some(c => c.name === collectionName)

    if (!exists) {
      // Create collection with proper configuration
      await client.createCollection(collectionName, {
        vectors: {
          size: QDRANT_CONFIG.vectorSize,
          distance: QDRANT_CONFIG.distance,
        },
        shard_number: 1,
        replication_factor: 1,
      })
      
      console.log(`Created Qdrant collection: ${collectionName}`)
    } else {
      console.log(`Qdrant collection already exists: ${collectionName}`)
    }
  } catch (error) {
    console.error('Error initializing Qdrant collection:', error)
    throw error
  }
}

/**
 * Store memory embedding in Qdrant
 */
export async function storeMemoryEmbedding(
  memoryId: string,
  weddingId: string,
  embedding: number[],
  metadata: {
    memoryText: string
    memoryType: string
    category?: string
    guestName?: string
    createdAt: string
  }
): Promise<void> {
  const client = getQdrantClient()
  const collectionName = `${QDRANT_CONFIG.collectionName}_${weddingId}`

  try {
    // Ensure collection exists
    await initializeCollection(weddingId)

    // Store the vector with metadata
    await client.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: memoryId,
          vector: embedding,
          payload: {
            memory_id: memoryId,
            wedding_id: weddingId,
            memory_text: metadata.memoryText,
            memory_type: metadata.memoryType,
            category: metadata.category || null,
            guest_name: metadata.guestName || null,
            created_at: metadata.createdAt,
          },
        },
      ],
    })

    console.log(`Stored embedding for memory ${memoryId} in collection ${collectionName}`)
  } catch (error) {
    console.error('Error storing memory embedding:', error)
    throw error
  }
}

/**
 * Search for similar memories
 */
export async function searchSimilarMemories(
  weddingId: string,
  queryEmbedding: number[],
  limit: number = 10,
  scoreThreshold: number = 0.7
): Promise<Array<{
  id: string
  score: number
  payload: any
}>> {
  const client = getQdrantClient()
  const collectionName = `${QDRANT_CONFIG.collectionName}_${weddingId}`

  try {
    const searchResult = await client.search(collectionName, {
      vector: queryEmbedding,
      limit,
      score_threshold: scoreThreshold,
      with_payload: true,
    })

    return searchResult.map(result => ({
      id: result.id as string,
      score: result.score,
      payload: result.payload,
    }))
  } catch (error) {
    console.error('Error searching similar memories:', error)
    // Return empty array if collection doesn't exist yet
    return []
  }
}

/**
 * Delete memory embedding from Qdrant
 */
export async function deleteMemoryEmbedding(
  memoryId: string,
  weddingId: string
): Promise<void> {
  const client = getQdrantClient()
  const collectionName = `${QDRANT_CONFIG.collectionName}_${weddingId}`

  try {
    await client.delete(collectionName, {
      wait: true,
      points: [memoryId],
    })

    console.log(`Deleted embedding for memory ${memoryId} from collection ${collectionName}`)
  } catch (error) {
    console.error('Error deleting memory embedding:', error)
    // Ignore errors if collection doesn't exist
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(weddingId: string): Promise<{
  vectorCount: number
  indexedCount: number
  status: string
} | null> {
  const client = getQdrantClient()
  const collectionName = `${QDRANT_CONFIG.collectionName}_${weddingId}`

  try {
    const info = await client.getCollection(collectionName)
    
    return {
      vectorCount: info.vectors_count || 0,
      indexedCount: info.indexed_vectors_count || 0,
      status: info.status,
    }
  } catch (error) {
    console.error('Error getting collection stats:', error)
    return null
  }
}

/**
 * Health check for Qdrant
 */
export async function checkQdrantHealth(): Promise<{
  healthy: boolean
  error?: string
  info?: any
}> {
  try {
    const client = getQdrantClient()
    
    // Try to get collections as a health check
    const collections = await client.getCollections()
    
    return {
      healthy: true,
      info: {
        collectionsCount: collections.collections.length,
        collections: collections.collections.map(c => c.name),
      }
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}