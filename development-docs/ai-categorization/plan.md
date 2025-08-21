# AI Categorization & Embeddings - Implementation Plan

## Overview
Implement AI-powered categorization that groups memories by specific shared events and experiences. The AI will identify when multiple people are talking about the same trip, event, or experience and compile their different perspectives together.

## Core Concept: Event-Based Categorization

### Vision
- **Not just broad categories** like "College Memories"
- **Specific shared experiences** like "Spring Break 2019 Cancun Trip" or "Weekly D&D Campaign at Jake's"
- **Multiple perspectives** on the same event compiled together
- **Dynamic category creation** based on what memories actually exist

### Examples of Categories We Want
- "That Epic Bachelor Party in Vegas"
- "The Summer Road Trip to Yellowstone"
- "Weekly Game Nights at Sarah's Apartment"
- "The Proposal at Sunset Beach"
- "Freshman Year Dorm Shenanigans"
- "The Company Retreat Karaoke Disaster"

### Why This Approach
- **Meaningful grouping**: Combines different perspectives of the same event
- **Natural storytelling**: Creates a richer narrative from multiple viewpoints
- **Discovery**: Surfaces shared experiences the couple might not realize multiple people remember
- **Personalized**: Categories emerge from actual memories, not predefined buckets

## Technical Architecture

### Database Design
```sql
-- Just add to existing memories table
ALTER TABLE memories 
ADD COLUMN category VARCHAR(255),
ADD COLUMN category_confidence DECIMAL(3,2),
ADD COLUMN categorization_metadata JSONB;

-- Getting unique categories is simple:
SELECT DISTINCT category FROM memories WHERE wedding_id = ? AND category IS NOT NULL;
```

### Categorization Metadata Example
```json
{
  "confidence": 0.85,
  "keywords": ["vegas", "bachelor party", "2023", "casino"],
  "matched_with": ["memory_id_123", "memory_id_456"],  // Other memories in same category
  "reasoning": "Multiple mentions of Vegas bachelor party with similar timeframe",
  "attempt_count": 1,
  "categorized_at": "2024-01-15T10:30:00Z"
}
```

### Tool Definitions for LLM
```typescript
const tools = [
  {
    name: 'get_existing_categories',
    description: 'Get all existing categories and their memory counts',
    returns: Array<{category: string, count: number}>
  },
  {
    name: 'get_memories_in_category',
    description: 'Get example memories from a specific category to understand context',
    parameters: { category: string },
    returns: Array<{id: string, text: string, guest_name: string}>
  }
]
```

## Processing Flow

### Immediate Processing with Retry
1. **On Memory Submission** (`/api/weddings/[slug]/memories` POST):
   - Save memory with `status: 'pending'`
   - Trigger categorization immediately (async)
   - Return success to user without waiting

2. **Categorization Process** (async function):
   - Fetch all existing categories
   - LLM analyzes memory with tool calls for context
   - Either assigns to existing category or creates new specific one
   - Update memory with category and metadata
   - Generate and store embedding in Qdrant
   - Set `status: 'processed'`

3. **Retry Cron** (`/api/cron/retry-categorization` - every minute):
   - Find memories with `status: 'failed'` or old `pending`
   - Retry categorization with exponential backoff
   - Stop if no failed memories found
   - Max 3 retries before marking as 'failed_permanent'

### LLM Prompt Strategy
```
You are categorizing wedding memories to group together different perspectives of the same events.

GOAL: Identify when people are talking about the SAME SPECIFIC event, trip, or experience.

GOOD Categories (Specific Events):
- "Spring Break 2019 Cancun Trip"
- "The Halloween Party Where John Dressed as a Dinosaur"
- "Weekly D&D Campaign at Mike's House"
- "The Proposal at Sunset Beach"

BAD Categories (Too Generic):
- "College Memories"
- "Funny Times"
- "Travel Stories"

Suggested Category Seeds (create these IF memories match):
- "[Year] [Location] Trip" for travel memories
- "The [Event] at [Location]" for specific events
- "[Frequency] [Activity] at [Person]'s" for recurring activities
- "[Person]'s [Event Type]" for personal milestones

Instructions:
1. First, check existing categories using get_existing_categories
2. If memory seems related to existing category, use get_memories_in_category to verify
3. Look for specific details: dates, locations, people, unique events
4. Create NEW category if this is a distinct event not yet captured
5. Category names should be specific and descriptive (15-50 characters)
```

## Implementation Steps

### Phase 1: Database & Types
- [ ] Add migration for category fields
- [ ] Update TypeScript types
- [ ] Add status enum: `pending`, `processing`, `processed`, `failed`, `failed_permanent`

### Phase 2: Categorization Service
- [ ] Create `/lib/ai/event-categorizer.ts` with tool calling
- [ ] Implement immediate categorization on submission
- [ ] Add metadata tracking for decisions
- [ ] Store confidence scores

### Phase 3: Embedding Pipeline
- [ ] Generate embeddings immediately after categorization
- [ ] Store in Qdrant with wedding_id namespace
- [ ] Include category in embedding metadata

### Phase 4: Retry System
- [ ] Create `/api/cron/retry-categorization` endpoint
- [ ] Implement exponential backoff
- [ ] Add monitoring for failure rates

## Success Metrics
- **Meaningful categories**: Each category represents a real shared experience
- **Multiple perspectives**: Categories with 2+ memories from different people
- **High confidence**: >80% categorization confidence on average
- **Fast processing**: 95% of memories categorized within 10 seconds
- **Low failure rate**: <5% permanent failures

## Why This Will Be Magical
- Guests will see their individual memory become part of a larger story
- The couple discovers shared experiences from multiple viewpoints  
- Natural emergence of "remember when..." moments
- Categories tell the story of the relationship through specific events