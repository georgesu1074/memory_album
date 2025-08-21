# AI Categorization & Embeddings - Implementation Plan (Simplified)

## Overview
Implement simple AI-powered categorization using Gemini with tool calls for a small-scale wedding database (few hundred memories max). Store embeddings in Qdrant for future RAG features.

## Simplified Architecture

### Why Simple Approach Works
- **Scale**: Only ~100-500 memories per wedding max
- **Categories**: Only need ~10-20 categories total
- **Simplicity**: Tool calls are more transparent and debuggable
- **Performance**: Can process all memories in seconds

### Core Strategy
1. **Simple Categorization**: Use Gemini with tool calls to check existing categories
2. **Direct Assignment**: Just add category name to memory record
3. **Background Processing**: Simple cron job every minute
4. **Embeddings**: Store for future, but don't use yet

## Implementation Steps

### Phase 1: Database Update
1. Add `category` field to memories table (simple string)
2. Add `processing_status` enum field
3. No need for separate categories table

### Phase 2: Simple Categorizer
1. Create Gemini service with two tool calls:
   - `get_existing_categories`: Returns list of unique categories
   - `assign_category`: Assigns memory to a category
2. LLM decides if memory fits existing category or needs new one
3. Store category name directly on memory record

### Phase 3: API & Cron
1. Create `/api/cron/categorize` endpoint
2. Process uncategorized memories every minute
3. Simple retry logic for failures

### Phase 4: Embeddings (Future-Ready)
1. Generate embeddings using Gemini
2. Store in Qdrant with memory_id
3. Don't query them yet (Phase 2 feature)

## Technical Details

### Tool Definitions
```typescript
const tools = [
  {
    name: 'get_existing_categories',
    description: 'Get all existing memory categories',
    parameters: {} // No parameters needed
  },
  {
    name: 'get_category_examples', 
    description: 'Get example memories from a category',
    parameters: {
      category: string
    }
  }
]
```

### Simple Flow
1. Fetch uncategorized memories
2. Get existing categories from DB
3. For each memory:
   - Ask Gemini to categorize using tool calls
   - Gemini checks existing categories
   - Assigns to existing or suggests new
   - Update memory record
4. Generate embedding and store

### Database Changes
```sql
ALTER TABLE memories 
ADD COLUMN category VARCHAR(100),
ADD COLUMN processing_status VARCHAR(20) DEFAULT 'pending';
```

## Why This Is Better

1. **Simpler**: No complex matching logic or consolidation
2. **Transparent**: Can see exactly what categories exist
3. **Debuggable**: Tool calls show LLM's decision process
4. **Sufficient**: Works perfectly for wedding scale
5. **Maintainable**: Easy to understand and modify

## Files to Create/Modify

### New Files
- `/lib/ai/simple-categorizer.ts` - Simple categorization with tools
- `/app/api/cron/categorize/route.ts` - Cron endpoint
- `/lib/ai/embedding-generator.ts` - Embedding generation

### Modified Files
- Database migration to add category field
- `/lib/ai/gemini.ts` - Add tool calling support

## Success Metrics
- All memories categorized within 2 minutes
- Categories make logical sense
- ~10-20 total categories per wedding
- Embeddings stored for future use