# Sprint 3: AI Categorization & Embeddings - Tasks

## Phase 1: Database & Types
- [ ] Add migration for category, category_confidence, and categorization_metadata fields
- [ ] Update TypeScript types for new fields
- [ ] Add status enum values: `pending`, `processing`, `processed`, `failed`, `failed_permanent`

## Phase 2: Categorization Service
- [ ] Create `/lib/ai/event-categorizer.ts` with tool calling support
- [ ] Implement get_existing_categories tool function
- [ ] Implement get_memories_in_category tool function
- [ ] Add immediate async categorization trigger to submission endpoint
- [ ] Add metadata tracking for categorization decisions
- [ ] Store confidence scores with each categorization

## Phase 3: Embedding Pipeline
- [ ] Generate embeddings immediately after categorization
- [ ] Store embeddings in Qdrant with wedding_id namespace
- [ ] Include category in embedding metadata
- [ ] Handle embedding failures gracefully

## Phase 4: Retry System
- [ ] Create `/api/cron/retry-categorization` endpoint
- [ ] Implement exponential backoff logic (1min, 2min, 4min)
- [ ] Add max retry limit (3 attempts)
- [ ] Add monitoring for failure rates
- [ ] Auto-stop cron when no failed memories found

## Phase 5: Testing & Validation
- [ ] Test with sample memories for event detection
- [ ] Verify multiple perspectives get grouped correctly
- [ ] Ensure category names are specific and meaningful
- [ ] Test retry mechanism with simulated failures