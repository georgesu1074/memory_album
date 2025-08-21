# AI Categorization & Embeddings Test Plan

## Test Environment
- Device: Desktop (for API testing) + Mobile (for submission flow)
- Browser: Chrome DevTools for network inspection
- Database: Supabase Dashboard for verification
- External Services: Gemini API, Qdrant Cloud

## Prerequisites
- [ ] Database migration applied (005_add_categorization_fields.sql)
- [ ] Environment variables set (GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY)
- [ ] Test wedding exists in database
- [ ] Qdrant collection created

## Functional Tests

### Test 1: Basic Memory Categorization
**Steps:**
1. Submit a memory about a specific event (e.g., "Remember that Vegas bachelor party in 2023? The casino incident was legendary!")
2. Check database for status='processing'
3. Wait for categorization (should be < 10 seconds)
4. Verify category field is populated with specific event name

**Expected Result:**
- Category should be something like "Vegas Bachelor Party 2023"
- Status should be 'completed'
- category_confidence should be > 0.5
- categorization_metadata should contain keywords

**Status:** [ ] Pass [ ] Fail
**Notes:** 

---

### Test 2: Multiple Perspectives Grouping
**Steps:**
1. Submit first memory: "The proposal at Sunset Beach was so romantic! She had no idea!"
2. Submit second memory: "I helped plan the Sunset Beach proposal. Hiding the photographer was tricky!"
3. Check both memories after processing

**Expected Result:**
- Both should have the same category (e.g., "The Proposal at Sunset Beach")
- categorization_metadata should show matched_with containing the other memory's ID

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test 3: Dynamic Category Creation
**Steps:**
1. Submit memory with unique event: "Our weekly D&D sessions at Mike's house shaped our friendship"
2. Submit another: "Remember the epic TPK during that D&D campaign at Mike's?"
3. Verify categorization

**Expected Result:**
- New specific category created (e.g., "Weekly D&D Campaign at Mike's House")
- Not a generic category like "Gaming Memories"

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test 4: Tool Call Functionality
**Steps:**
1. Check server logs during categorization
2. Look for tool call executions (get_existing_categories, get_memories_in_category)

**Expected Result:**
- Logs should show tool calls being made
- Tool responses should be processed correctly

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test 5: Embedding Generation
**Steps:**
1. After memory is categorized, check Qdrant dashboard
2. Query collection for wedding ID
3. Verify embedding exists with metadata

**Expected Result:**
- Point exists in Qdrant with memory_id as ID
- Metadata includes category, wedding_id, memory_type
- Vector dimension is 768

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test 6: Async Processing (Non-blocking)
**Steps:**
1. Submit a memory
2. Measure response time
3. Check if response returns before categorization completes

**Expected Result:**
- Response should return immediately (< 1 second)
- Categorization happens in background
- User sees success message without waiting

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

## Error Handling Tests

### Test 7: Failed Categorization Retry
**Steps:**
1. Temporarily break Gemini API key
2. Submit a memory
3. Check status='failed' in database
4. Fix API key
5. Wait for cron job (1 minute)
6. Check if retry succeeded

**Expected Result:**
- Initial status: 'failed'
- retry_count increments
- After fix and cron: status='completed'
- Exponential backoff observed (1min, 2min, 4min)

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test 8: Permanent Failure After 3 Retries
**Steps:**
1. Keep Gemini API broken
2. Submit memory
3. Wait for 3 retry attempts
4. Check final status

**Expected Result:**
- status='failed_permanent' after 3 retries
- retry_count=3
- processing_error field contains error message

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test 9: Stuck Memory Recovery
**Steps:**
1. Manually set a memory to status='pending' with old timestamp
2. Run cron job
3. Check if it gets processed

**Expected Result:**
- Old pending memories (>5 min) get picked up
- Successfully categorized

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

## Edge Cases

### Test 10: Empty/Minimal Memory Text
**Steps:**
1. Submit memory with just "Fun times!"
2. Check categorization

**Expected Result:**
- Should still categorize (likely as "Uncategorized Memories")
- Shouldn't crash
- Low confidence score

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test 11: Very Long Memory Text
**Steps:**
1. Submit 1000 character memory with multiple events mentioned
2. Check categorization

**Expected Result:**
- Should pick the most prominent event
- Not create multiple categories
- Handle token limits gracefully

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### Test 12: Special Characters in Memory
**Steps:**
1. Submit memory with emojis, quotes, special chars: "The "best" party ever! 🎉🎊"
2. Check processing

**Expected Result:**
- Should handle special characters
- JSON parsing shouldn't break
- Category name should be clean

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

## Performance Tests

### Test 13: Categorization Speed
- [ ] Single memory categorized in < 10 seconds
- [ ] Embedding generated in < 5 seconds
- [ ] No timeout errors

### Test 14: Cron Job Efficiency
- [ ] Cron completes in < 30 seconds with 10 memories
- [ ] Doesn't process same memory twice
- [ ] Stops early if no memories to process

## Database Verification

### Test 15: Data Integrity
- [ ] All new fields populated correctly
- [ ] Indexes created and working
- [ ] No orphaned records
- [ ] Metadata stored as proper JSON

## API Monitoring
- [ ] No 500 errors in logs
- [ ] Gemini API quota not exceeded
- [ ] Qdrant connection stable
- [ ] Memory submission endpoint still works

## Security
- [ ] Cron endpoint protected in production
- [ ] No sensitive data in logs
- [ ] API keys not exposed