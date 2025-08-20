# AI Categorization Strategy - Memory Album

## Problem Statement

When multiple guests submit similar memories simultaneously, we need to:
1. Group related memories together intelligently
2. Prevent duplicate categories from race conditions
3. Provide fast feedback to users
4. Allow human oversight without blocking submission

### Race Condition Example
```
Time 0:00 - Guest A: "The karaoke was hilarious!"
Time 0:01 - Guest B: "Remember John's terrible singing?"
Time 0:02 - Guest C: "That karaoke disaster was epic!"

Bad outcome: 3 separate categories created
Good outcome: 1 "Karaoke Night" category with 3 memories
```

## Recommended Solution: Hybrid Approach

### Overview
Combine immediate AI suggestions with background consolidation to provide fast UX while preventing duplicates.

### Implementation Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Submits Memory                │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│          1. Save Memory Immediately (0.1s)          │
│              - No blocking operations                │
│              - Return memory_id                      │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│       2. Quick AI Categorization (2-3s async)       │
│              - Call Gemini in background             │
│              - Suggest category name                 │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│    3. Atomic Category Assignment (DB Function)      │
│              - Find or create category               │
│              - Handle race conditions                │
└────────────────┬────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────┐
│     4. Background Consolidation (Every 5 min)       │
│              - Merge similar categories              │
│              - Update group summaries                │
└─────────────────────────────────────────────────────┘
```

## Detailed Implementation

### Step 1: API Endpoint (Immediate Response)
```typescript
// app/api/weddings/[slug]/memories/route.ts
export async function POST(req: Request) {
  const { wedding_slug } = params
  const { guest_id, guest_name, memory_text, photos } = await req.json()
  
  // 1. Save memory instantly (no AI blocking)
  const memory = await supabase
    .from('memories')
    .insert({
      wedding_id: wedding.id,
      guest_id,
      guest_name,
      memory_text,
      is_processed: false,
      processing_priority: Date.now()
    })
    .select()
    .single()
  
  // 2. Queue for AI processing (non-blocking)
  await queueForProcessing(memory.id)
  
  // 3. Return immediately
  return NextResponse.json({
    success: true,
    memory_id: memory.id,
    message: "Memory saved! We're organizing it now..."
  })
}
```

### Step 2: Background Processor (Continuous)
```typescript
// lib/processors/memory-processor.ts
export async function processMemoryQueue() {
  // Get batch of unprocessed memories
  const batch = await supabase
    .from('memories')
    .select('*')
    .eq('is_processed', false)
    .eq('wedding_id', wedding_id)
    .order('processing_priority')
    .limit(5)  // Process 5 at a time for context
  
  if (batch.data.length === 0) return
  
  // Send batch to Gemini for group categorization
  const categories = await categorizeBatch(batch.data)
  
  // Assign categories using atomic DB operations
  for (const memory of batch.data) {
    const category = categories[memory.id]
    await assignCategoryAtomic(memory.id, category)
  }
}

async function categorizeBatch(memories: Memory[]) {
  const prompt = `
    Categorize these wedding memories into groups.
    If memories are about the same event/story, group them together.
    
    Memories:
    ${memories.map(m => `- "${m.memory_text}"`).join('\n')}
    
    Return JSON: { memory_id: category_name }
  `
  
  const response = await gemini.generateContent(prompt)
  return JSON.parse(response.text())
}
```

### Step 3: Database Functions (Race Condition Prevention)
```sql
-- Function to atomically find or create category
CREATE OR REPLACE FUNCTION assign_category_atomic(
  p_memory_id UUID,
  p_category_name TEXT,
  p_wedding_id UUID
) RETURNS UUID AS $$
DECLARE
  v_category_id UUID;
  v_existing_id UUID;
BEGIN
  -- Try to find existing similar category (within last hour)
  SELECT id INTO v_existing_id
  FROM memory_groups
  WHERE wedding_id = p_wedding_id
    AND similarity(title, p_category_name) > 0.7
    AND created_at > NOW() - INTERVAL '1 hour'
  ORDER BY similarity(title, p_category_name) DESC
  LIMIT 1;
  
  IF v_existing_id IS NOT NULL THEN
    -- Use existing category
    v_category_id := v_existing_id;
    
    -- Increment count
    UPDATE memory_groups 
    SET memory_count = memory_count + 1
    WHERE id = v_category_id;
  ELSE
    -- Create new category (handle duplicate attempts)
    INSERT INTO memory_groups (wedding_id, title, memory_count)
    VALUES (p_wedding_id, p_category_name, 1)
    ON CONFLICT (wedding_id, title) 
    DO UPDATE SET memory_count = memory_groups.memory_count + 1
    RETURNING id INTO v_category_id;
  END IF;
  
  -- Assign memory to category
  UPDATE memories 
  SET 
    group_id = v_category_id,
    is_processed = true,
    ai_category = p_category_name,
    updated_at = NOW()
  WHERE id = p_memory_id;
  
  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql;

-- Add similarity extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add unique constraint to prevent exact duplicates
ALTER TABLE memory_groups 
ADD CONSTRAINT unique_category_per_wedding 
UNIQUE (wedding_id, title);
```

### Step 4: Consolidation Job (Periodic)
```typescript
// app/api/cron/consolidate-categories/route.ts
export async function GET() {
  // Run every 5 minutes via Vercel Cron
  const weddings = await getActiveWeddings()
  
  for (const wedding of weddings) {
    // Find similar categories to merge
    const duplicates = await supabase.rpc('find_duplicate_categories', {
      wedding_id: wedding.id,
      similarity_threshold: 0.8
    })
    
    for (const group of duplicates) {
      await mergeCategories(group.primary_id, group.duplicate_ids)
    }
    
    // Regenerate AI summaries for updated groups
    await regenerateSummaries(wedding.id)
  }
  
  return NextResponse.json({ success: true })
}
```

## Processing Options Comparison

### Option A: Synchronous (Simple but Blocking)
- ✅ Immediate categorization
- ❌ 2-3 second wait for users
- ❌ High race condition risk
- ❌ No batch context

### Option B: Pure Async Queue (Current Docs)
- ✅ No blocking
- ✅ Good batch context
- ❌ Delayed categorization
- ❌ Complex retry logic

### Option C: Hybrid (Recommended)
- ✅ Instant save (no blocking)
- ✅ Smart categorization with context
- ✅ Race condition prevention
- ✅ Background consolidation
- ✅ Scales from 1 to 10,000 weddings

## Configuration

### Environment Variables
```env
# Processing configuration
PROCESS_BATCH_SIZE=5              # Memories to process together
CATEGORY_SIMILARITY_THRESHOLD=0.7  # How similar categories need to be
CONSOLIDATION_INTERVAL=300         # Seconds between consolidation (5 min)
MAX_PROCESSING_RETRIES=3          # Retry failed categorizations
```

### Vercel Cron Configuration
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-memories",
      "schedule": "* * * * *"  // Every minute for processing
    },
    {
      "path": "/api/cron/consolidate-categories", 
      "schedule": "*/5 * * * *"  // Every 5 minutes for consolidation
    }
  ]
}
```

## Human-in-the-Loop Extension (Future)

### Optional UI Flow
1. User submits memory
2. Show "Organizing..." for 2-3 seconds
3. Display AI suggestion: "Add to 'College Stories'?"
4. Options:
   - ✅ Accept (one click)
   - 🔄 Choose different (show dropdown)
   - ➕ Create new (text input)
   - ⏭️ Skip (AI decides later)

### Implementation
```typescript
// Return suggestion to frontend
return {
  memory_id: memory.id,
  suggested_category: {
    id: category.id,
    name: category.title,
    confidence: 0.85
  },
  alternative_categories: similar_categories,
  can_create_new: true
}
```

## Metrics to Track

### Performance Metrics
- Average categorization time
- Category duplication rate
- Consolidation effectiveness
- User acceptance rate (if human-in-loop)

### Quality Metrics
- Categories per wedding (target: 15-30)
- Memories per category (target: 5-20)
- Uncategorized memories (target: <5%)

## Migration Path

### Phase 1 (MVP)
- Basic async processing
- Simple category creation
- Manual consolidation

### Phase 2
- Add similarity matching
- Automatic consolidation
- Batch processing

### Phase 3
- Human-in-the-loop UI
- Learning from user corrections
- Smart suggestions

### Phase 4
- Real-time collaborative categorization
- Multi-language support
- Advanced AI grouping

## Testing Strategy

### Unit Tests
```typescript
describe('Category Assignment', () => {
  it('should handle simultaneous submissions', async () => {
    // Submit 3 similar memories concurrently
    const promises = [
      submitMemory('Karaoke was fun'),
      submitMemory('Great karaoke night'),
      submitMemory('Loved the karaoke')
    ]
    
    await Promise.all(promises)
    
    // Should create only 1 category
    const categories = await getCategories()
    expect(categories).toHaveLength(1)
    expect(categories[0].memory_count).toBe(3)
  })
})
```

### Load Testing
- Simulate 100 concurrent submissions
- Verify no duplicate categories
- Measure processing time
- Check consolidation effectiveness

## Conclusion

The hybrid approach provides the best balance of:
- **User Experience**: Instant saves, no blocking
- **Data Quality**: Intelligent grouping, prevents duplicates
- **Scalability**: Works from 1 to 10,000 weddings
- **Flexibility**: Can add human oversight later

This architecture is production-ready and can scale with minimal changes.