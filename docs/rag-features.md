# Memory Album - Future RAG Features

## Overview
This document outlines potential RAG (Retrieval-Augmented Generation) features for Phase 2 and beyond. During Phase 1, we're collecting embeddings but not using them. This creates a rich dataset for future features.

## Why We're Collecting Embeddings Now

### Strategic Advantages
- **Zero Migration**: Features can be enabled without reprocessing old data
- **Historical Data**: Can analyze patterns from day one
- **A/B Testing**: Can compare RAG vs non-RAG approaches
- **Learning Opportunity**: Understand embedding patterns before building features
- **Cost**: Essentially free at wedding scale (< 1000 vectors)

### What We're Storing (Phase 1)
```typescript
// For each memory
{
  text_embedding: float[768],      // From text-embedding-004
  image_embeddings: float[768][],   // One per photo (future)
  metadata: {
    memory_id: string,
    wedding_id: string,
    type: 'bride' | 'groom' | 'both',
    timestamp: Date,
    guest_name: string
  }
}
```

## Phase 2: Core RAG Features

### 1. Semantic Memory Search
**User Experience:**
- "Show me all funny stories"
- "Find memories about college"
- "Search for beach moments"

**Implementation:**
```python
# Simple semantic search
query_embedding = embed("funny stories")
results = qdrant.search(
    collection=f"wedding_{wedding_id}",
    query_vector=query_embedding,
    limit=10,
    score_threshold=0.7
)
```

### 2. Similar Memory Discovery
**User Experience:**
- "More memories like this one"
- Auto-suggest related memories while browsing
- "People who enjoyed this also liked..."

**Technical Approach:**
- Use current memory's embedding as query
- Filter by similarity threshold
- Exclude current memory from results

### 3. Duplicate Detection
**User Experience:**
- Prevent duplicate memories from being created
- Merge similar submissions automatically
- Show "X people shared similar memories"

**Implementation:**
```python
# Before creating new memory
new_embedding = embed(new_content)
similar = qdrant.search(
    query_vector=new_embedding,
    score_threshold=0.9  # High threshold for duplicates
)
if similar:
    merge_with_existing(similar[0])
```

### 4. Memory Clustering
**User Experience:**
- Auto-generate memory categories
- "The College Years" (auto-detected theme)
- Visual cluster map of all memories

**Technical Approach:**
- HDBSCAN clustering on embeddings
- Generate cluster labels with Gemini
- Interactive visualization with D3.js

## Phase 3: Advanced RAG Features

### 5. Image-Based RAG
**User Experience:**
- "Find all sunset photos"
- "Show pictures with the whole group"
- "Find photos from the beach"

**Implementation:**
```python
# Generate image embeddings
for photo in photos:
    description = gemini.describe_image(photo)
    image_embedding = embed(description)
    qdrant.upsert(image_embedding, {
        "type": "image",
        "photo_id": photo.id
    })
```

### 6. Cross-Memory Insights
**User Experience:**
- "How did our relationship evolve?"
- Timeline visualization with semantic transitions
- Relationship journey map

**Technical Approach:**
- Temporal embedding analysis
- Identify semantic shifts over time
- Generate narrative transitions

### 7. Guest Relationship Mapping
**User Experience:**
- "Show memories from college friends"
- Social graph of memory connections
- "Who knows the couple best?" leaderboard

**Implementation:**
- Extract entities from memories
- Build knowledge graph
- Community detection algorithms

### 8. Memory Recommendations
**User Experience:**
- "You might enjoy these memories"
- Personalized memory feed
- "Trending memories at this wedding"

**Technical Approach:**
- Collaborative filtering on view patterns
- Content-based filtering via embeddings
- Hybrid recommendation system

## Phase 4: AI-Powered Creation

### 9. AI Memory Book Generation
**User Experience:**
- Auto-generate wedding book from memories
- Thematic chapters with AI transitions
- Professional layout with photos

**Implementation:**
```python
# Cluster memories into chapters
chapters = cluster_memories(all_embeddings)

# Generate transitions
for i in range(len(chapters)-1):
    transition = gemini.generate_transition(
        chapters[i].summary,
        chapters[i+1].summary
    )
```

### 10. Interactive Memory Assistant
**User Experience:**
- "Tell me about the proposal"
- "What did people say about the ceremony?"
- Conversational memory exploration

**Technical Approach:**
- RAG-powered chatbot
- Retrieve relevant memories for context
- Generate responses with citations

## Technical Implementation Notes

### Embedding Pipeline (Phase 1 Implementation)
```typescript
// Next.js API Route
export async function POST(request: Request) {
  // Save memory to database
  const memory = await saveMemory(data)
  
  // Queue embedding generation (non-blocking)
  await queueJob('generate-embedding', {
    memory_id: memory.id,
    content: data.content,
    photos: data.photos
  })
  
  return Response.json({ success: true })
}

// Background job (Vercel Cron or Queue)
async function generateEmbedding(job) {
  const embedding = await gemini.embed(job.content)
  
  await qdrant.upsert(
    collection: `wedding_${job.wedding_id}`,
    points: [{
      id: job.memory_id,
      vector: embedding,
      payload: {
        memory_id: job.memory_id,
        timestamp: new Date()
      }
    }]
  )
}
```

### Vector Storage Strategy
- **Namespace per wedding**: Isolation and easy cleanup
- **Metadata in payload**: Enable filtered searches
- **Hybrid search ready**: Can combine with SQL filters

### Performance Considerations
- **Async embedding**: Don't block user submission
- **Batch operations**: Process multiple embeddings together
- **Cache embeddings**: Store in Qdrant, never regenerate
- **Lazy image embeddings**: Generate only when needed

## Migration Path from Phase 1 to Phase 2

### Enabling RAG Features (No Code Changes Needed for Data)
1. **Existing embeddings ready**: Already in Qdrant
2. **Add search endpoint**: New API route
3. **Update UI**: Add search bar
4. **Enable features**: Gradual rollout

### Code Changes Required
```typescript
// Add to existing API
export async function GET(request: Request) {
  const { search } = await request.json()
  
  // This is NEW - but data is already there!
  const embedding = await gemini.embed(search)
  const results = await qdrant.search(
    wedding_id,
    embedding
  )
  
  return Response.json(results)
}
```

## Cost Analysis for RAG Features

### Embedding Costs (Phase 1)
- **Text**: $0.00001 per 1k tokens
- **200 memories**: ~$0.02 total
- **Storage**: Free (Qdrant free tier)

### Search Costs (Phase 2)
- **Vector search**: Free (Qdrant)
- **Gemini API**: ~$0.001 per search
- **1000 searches**: ~$1

### Why It's Worth It
- **Better UX**: Find memories instantly
- **Unique features**: No other wedding app has this
- **Data moat**: Embeddings improve over time
- **Product differentiation**: Premium feature for paid tiers

## Competitive Advantages

### Why RAG Makes This Product Unique
1. **Semantic Understanding**: Beyond keyword search
2. **Automatic Organization**: No manual categorization
3. **Discovery Features**: Surface forgotten memories
4. **Personalization**: Each wedding is unique
5. **Scale**: Works for 10 or 10,000 memories

### Potential Premium Features
- Advanced search filters
- AI-generated memory books
- Cross-wedding insights (anonymized)
- API access for embeddings
- Custom AI models per wedding

## Research & Development Ideas

### Experimental Features to Explore
1. **Emotion Analysis**: Cluster by sentiment
2. **Writing Style Matching**: Identify same guest across anonymous entries
3. **Temporal Patterns**: How memories change throughout event
4. **Multimodal Search**: Search by drawing or humming
5. **AR Memory Walls**: Spatial memory browsing

### Data Science Opportunities
- Wedding memory patterns across cultures
- Optimal memory collection strategies
- Prediction models for memory engagement
- Network effects in memory sharing

## Conclusion

By collecting embeddings in Phase 1, we're building a foundation for powerful features without additional overhead. The data collected at your wedding will help shape the product's future, and every memory submitted makes the system smarter.

The transition from Phase 1 to Phase 2 is seamless - just enable the features when ready. No data migration, no reprocessing, just flip the switch and watch the magic happen.