# Sprint 3: AI Categorization & Embeddings - Tasks

## Phase 1: Database & Types
- [x] Add migration for category, category_confidence, and categorization_metadata fields
- [x] Update TypeScript types for new fields
- [x] Add status enum values: `pending`, `processing`, `processed`, `failed`, `failed_permanent`

## Phase 2: Categorization Service
- [x] Create `/lib/ai/event-categorizer.ts` with tool calling support
- [x] Implement get_existing_categories tool function
- [x] Implement get_memories_in_category tool function
- [x] Add immediate async categorization trigger to submission endpoint
- [x] Add metadata tracking for categorization decisions
- [x] Store confidence scores with each categorization

## Phase 3: Embedding Pipeline
- [x] Generate embeddings immediately after categorization
- [x] Store embeddings in Qdrant with wedding_id namespace
- [x] Include category in embedding metadata
- [x] Handle embedding failures gracefully

## Phase 4: Retry System
- [x] Create `/api/cron/retry-categorization` endpoint
- [x] Implement exponential backoff logic (1min, 2min, 4min)
- [x] Add max retry limit (3 attempts)
- [ ] Add monitoring for failure rates
- [x] Auto-stop cron when no failed memories found

## Phase 5: Testing & Validation
- [ ] Test with sample memories for event detection
- [ ] Verify multiple perspectives get grouped correctly
- [ ] Ensure category names are specific and meaningful
- [ ] Test retry mechanism with simulated failures