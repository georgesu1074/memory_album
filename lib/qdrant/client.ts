import { QdrantClient } from '@qdrant/js-client-rest'

let qdrantClient: QdrantClient | null = null

export async function getQdrantClient(): Promise<QdrantClient> {
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    throw new Error('Missing Qdrant environment variables')
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
 * Health check for Qdrant connection
 */
export async function checkQdrantHealth(): Promise<{
  healthy: boolean
  error?: string
}> {
  try {
    const client = await getQdrantClient()
    const info = await client.getCollections()
    return {
      healthy: true
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}