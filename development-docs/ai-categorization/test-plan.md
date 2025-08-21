# AI Categorization & Embeddings Test Plan

## Test Environment
- Device: Desktop (for API testing) + Mobile (for submission flow)
- Browser: Chrome DevTools for network inspection
- Database: Supabase Dashboard for verification
- External Services: Gemini API, Qdrant Cloud

## Prerequisites
- [x] Database migration applied (005_add_categorization_fields.sql)
- [x] Environment variables set (GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY)
- [x] Test wedding exists in database
- [ ] Qdrant collection created

## Manual Testing Steps

### 1. Start the dev server
```bash
cd /Users/georgesu/projects/memory_album
npm run dev
```
Note which port it starts on (likely 3000, 3001, or 3002)

### 2. Open the app
Navigate to: `http://localhost:[PORT]/test-wedding-2024`

### 3. Submit Test Memory #1 (Basic Categorization)

**Steps:**
- Click **"Share a Memory"** button
- Guest name: **"John Smith"**
- Memory type: **"Groom"**
- Memory text: **"Remember that epic Vegas bachelor party in 2023? The casino incident where Jake lost his shoe was legendary!"**
- Click Submit

**Expected Terminal Logs:**
```
[CATEGORIZATION] Starting async categorization for memory...
[PROCESS] Starting processing for memory...
[PROCESS] Categorizing: "Remember that epic Vegas..."
[PROCESS] Category assigned: "Vegas Bachelor Party 2023" with confidence 0.85
```

**Database Verification:**
```sql
SELECT id, guest_name, category, category_confidence, status, 
       LEFT(memory_text, 50) as preview
FROM memories 
WHERE guest_name = 'John Smith'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- Category: Something like "Vegas Bachelor Party 2023" or "Epic Vegas Bachelor Party"
- Status: 'completed'
- category_confidence: > 0.5

**Status:** [ ] Pass [ ] Fail
**Notes:** 

---

### 4. Submit Test Memory #2 & #3 (Multiple Perspectives)

**Memory 2:**
- Guest: **"Sarah Jones"**
- Type: **"Bride"**
- Text: **"The proposal at Sunset Beach was so romantic! She had no idea it was coming!"**

**Memory 3:**
- Guest: **"Mike Wilson"**
- Type: **"Both"**
- Text: **"I helped plan the Sunset Beach proposal. Hiding the photographer behind the rocks was tricky!"**

**Database Verification:**
```sql
SELECT guest_name, category, category_confidence
FROM memories 
WHERE memory_text LIKE '%Sunset Beach%'
ORDER BY created_at DESC;
```

**Expected Result:**
- Both memories should have the SAME category (e.g., "The Proposal at Sunset Beach")
- This demonstrates multiple perspectives being grouped together

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### 5. Test Dynamic Category Creation

**Memory 4:**
- Guest: **"Alex Chen"**
- Type: **"Groom"**
- Text: **"Our weekly D&D sessions at Mike's house shaped our friendship. Remember when we fought that dragon for 6 hours straight?"**

**Expected Result:**
- Creates a NEW specific category like "Weekly D&D Sessions at Mike's House"
- NOT a generic category like "Gaming Memories"

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### 6. Test Category Summary Generation

**Purpose:** Verify AI generates story-like summaries that scale with memory count

#### Test 6A: Add More Vegas Memories (Test Multi-Perspective Summary)

**Memory 5:**
- Guest: **"Tom Bradley"**
- Type: **"Groom"**
- Text: **"That Vegas bachelor party was insane! Jake losing his shoe at the blackjack table became the weekend's running joke. We even made him a cardboard replacement!"**

**Memory 6:**
- Guest: **"Ryan Cooper"**
- Type: **"Groom"**  
- Text: **"The best part of Vegas 2023 was when security thought Jake's missing shoe was a prank. Watching him explain it seriously while hopping on one foot was priceless!"**

**Expected Category Summary (3 memories → 3-4 sentences):**
Should weave all three perspectives into a cohesive story about the legendary shoe incident.

#### Test 6B: Add More Sunset Beach Memories (Test Romantic Summary)

**Memory 7:**
- Guest: **"Jennifer Lee"**
- Type: **"Bride"**
- Text: **"I was the secret photographer at Sunset Beach! Watching her face transform from confusion to pure joy when he dropped to one knee - that's the shot that made it all worth it."**

**Memory 8:**
- Guest: **"David Park"**
- Type: **"Both"**
- Text: **"We were all hiding behind various rocks at Sunset Beach, trying not to giggle. When she said yes, we couldn't help but cheer - totally blew our cover but made the moment even better!"**

**Expected Category Summary (4 memories → 3-5 sentences):**
Should create a heartwarming narrative combining all perspectives of the proposal.

#### Test 6C: Single Memory Summary (New Category)

**Memory 9:**
- Guest: **"Lisa Martinez"**
- Type: **"Bride"**
- Text: **"The bride's 30th birthday surprise in Paris was unforgettable. She thought we were just having dinner, but we'd secretly flown in her parents from Australia. Her tears of joy lit up the entire restaurant!"**

**Expected Category:** "30th Birthday Surprise in Paris" or similar
**Expected Summary (1 memory → 1-2 sentences):**
Should create a concise, touching summary of this single memory.

**Database Verification:**
```sql
-- Check categories table for summaries
SELECT name, memory_count, summary 
FROM categories 
WHERE wedding_id = '16dd6f94-1cd7-4446-b748-367ca94a2c18'
ORDER BY memory_count DESC;
```

**Success Criteria:**
- [ ] Single memory gets 1-2 sentence summary
- [ ] 3 memories get 3-4 sentence summary  
- [ ] 4+ memories get 3-5 sentence summary
- [ ] Summaries read like mini stories, not clinical descriptions
- [ ] Different perspectives are woven together cohesively

**Status:** [ ] Pass [ ] Fail
**Notes:**

---

### 7. Verify Embeddings in Qdrant

**Check Qdrant Dashboard or use API:**
```bash
# Replace {wedding_id} and {memory_id} with actual values
curl -X GET "$QDRANT_URL/collections/wedding-{wedding_id}/points/{memory_id}" \
  -H "api-key: $QDRANT_API_KEY"
```

**Expected:**
- Point exists with memory_id as ID
- Vector dimension is 768
- Metadata includes category, wedding_id, memory_type

**Status:** [ ] Pass [ ] Fail

---

### 8. Test Retry Mechanism (Failed Categorization)

**Steps:**
1. Temporarily break something (e.g., wrong API key)
2. Submit a memory
3. Check database for status='failed'
4. Fix the issue
5. Wait 1 minute for cron job OR manually trigger: `POST http://localhost:[PORT]/api/cron/retry-categorization`

**Database Check:**
```sql
SELECT id, status, retry_count, processing_error
FROM memories 
WHERE status IN ('failed', 'failed_permanent')
ORDER BY created_at DESC;
```

**Expected:**
- Initial status: 'failed' with retry_count incrementing
- After fix and retry: status='completed'

**Status:** [ ] Pass [ ] Fail

---

## Database Queries for Overall Verification

### Check all memories and their categories
```sql
SELECT id, guest_name, category, category_confidence, status, retry_count, 
       LEFT(memory_text, 50) as preview
FROM memories 
WHERE wedding_id = (SELECT id FROM weddings WHERE slug = 'test-wedding-2024')
ORDER BY created_at DESC;
```

### Check unique categories created
```sql
SELECT DISTINCT category, COUNT(*) as count
FROM memories 
WHERE wedding_id = (SELECT id FROM weddings WHERE slug = 'test-wedding-2024') 
  AND category IS NOT NULL
GROUP BY category
ORDER BY count DESC;
```

### Check processing status distribution
```sql
SELECT status, COUNT(*) 
FROM memories 
WHERE wedding_id = (SELECT id FROM weddings WHERE slug = 'test-wedding-2024')
GROUP BY status;
```

### Check categorization metadata
```sql
SELECT id, categorization_metadata
FROM memories 
WHERE wedding_id = (SELECT id FROM weddings WHERE slug = 'test-wedding-2024') 
  AND category IS NOT NULL
LIMIT 5;
```

---

## Performance Tests

### Test 8: Categorization Speed
- [ ] Single memory categorized in < 10 seconds
- [ ] Check processing_started_at vs processing_completed_at in database

### Test 9: Concurrent Processing
- [ ] Submit 3 memories rapidly
- [ ] All should process without blocking each other
- [ ] Check logs for parallel processing

---

## Edge Cases

### Test 10: Empty/Minimal Memory Text
**Input:** Just "Fun times!"
**Expected:** Should categorize (likely as "Uncategorized Memories") without crashing

### Test 11: Very Long Memory Text
**Input:** 1000 character story with multiple events
**Expected:** Should pick the most prominent event, handle token limits

### Test 12: Special Characters
**Input:** "The "best" party ever! 🎉🎊 @ Vegas #Bachelor2023"
**Expected:** Should handle special characters, category name should be clean

---

## Mobile Testing
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Submission works smoothly
- [ ] No UI breaks

---

## Sign-off Checklist
- [ ] Categories are specific events, not generic buckets
- [ ] Multiple perspectives on same event get grouped together
- [ ] Embeddings stored successfully in Qdrant
- [ ] Retry mechanism works for failed categorizations
- [ ] No console errors in browser
- [ ] Performance is acceptable (< 10s per memory)
- [ ] Ready for production