# Scalability Analysis - Memory Album

## Load Estimates

### Scale Targets
- **MVP (Current)**: 1 wedding, ~1,000 memories/day
- **Year 1**: 100 weddings, ~20,000 memories total
- **Maximum Scale**: 10,000 weddings/year, 2M memories/year

### Peak Load Calculations
- **Weddings**: 200/weekend (100/day on Saturday)
- **Memories per wedding**: 200 average
- **Peak daily load**: 20,000 memories
- **Peak hourly**: ~2,500 memories (evening rush)
- **Peak minute**: ~42 memories
- **LLM calls**: Same as memory count (1:1 ratio)

## Current Architecture Capacity

### Vercel (Next.js Hosting)
- **Concurrent Functions**: 1,000 (Hobby), 10,000 (Pro)
- **Execution Time**: 10s (Hobby), 60s (Pro)
- **Bandwidth**: 100GB (Hobby), 1TB (Pro)
- **Assessment**: Can handle 50x maximum load on free tier

### Supabase (Database)
- **Connections**: 500 concurrent (Free), Unlimited (Pro)
- **Database Size**: 500MB (Free), 8GB (Pro)
- **Row Count**: No limits
- **Assessment**: Can handle 1M+ memories easily

### Google Gemini (AI)
- **Rate Limit**: 2,000 requests/minute
- **Response Time**: ~2 seconds average
- **Cost**: <$3 per 200-guest wedding
- **Assessment**: 47x headroom over peak load

### Qdrant (Vector DB)
- **Free Tier**: 1GB RAM (1M+ vectors)
- **Query Speed**: <100ms
- **Assessment**: Sufficient for 100+ weddings

## Architecture Decision: Monolith vs Microservices

### Current Choice: Monolithic Next.js ✅

**Pros:**
- Simple deployment (one codebase)
- Easy local development
- Shared types/validation
- Lower operational overhead
- Perfect for <1M requests/day

**Cons:**
- All components scale together
- Single point of failure
- Harder to optimize individual services

### Why NOT Microservices (Yet)

Microservices add complexity without benefits at this scale:
- **API Gateway**: Vercel Edge already provides this
- **Service Discovery**: Not needed with <5 services
- **Message Queues**: Database queue pattern sufficient
- **Container Orchestration**: Serverless handles scaling

## Scaling Strategy

### Phase 1: MVP (Current) ✅
```
Next.js API Routes → Supabase → Gemini
```
- Direct API calls
- Synchronous processing where possible
- Simple error handling

### Phase 2: 100 Weddings
```
Next.js → Supabase → Background Jobs → Gemini
```
- Add background processing for AI
- Implement rate limiting
- Add caching layer

### Phase 3: 1,000 Weddings
```
Next.js → Redis Cache → Supabase → SQS → Gemini
```
- Add Redis for session/cache
- Use proper message queue
- Implement circuit breakers

### Phase 4: 10,000+ Weddings
```
API Gateway → Microservices → Event Bus → Multiple DBs
```
- Separate services for auth, memories, AI
- Event-driven architecture
- Multi-region deployment

## Database Queue Pattern (Recommended)

Instead of complex message queues, use the database:

```sql
-- Queue table (already in our schema as 'memories')
CREATE TABLE memories (
  id UUID PRIMARY KEY,
  is_processed BOOLEAN DEFAULT false,
  processing_started_at TIMESTAMP,
  retry_count INTEGER DEFAULT 0,
  -- ... other fields
);

-- Get next batch to process
SELECT * FROM memories 
WHERE is_processed = false 
  AND (processing_started_at IS NULL 
    OR processing_started_at < NOW() - INTERVAL '5 minutes')
ORDER BY created_at ASC
LIMIT 10;
```

Benefits:
- No additional infrastructure
- Built-in persistence
- Easy monitoring
- Natural retry mechanism

## Bottleneck Analysis

### Potential Bottlenecks (in order)
1. **LLM Rate Limits** (2,000/min) - Use batching
2. **Database Connections** (500) - Use connection pooling
3. **Serverless Cold Starts** - Keep functions warm
4. **Storage Upload Speed** - Use direct uploads to Supabase

### Non-Issues
- **Database Storage**: 2M rows = ~2GB (well within limits)
- **Vector Storage**: 2M embeddings = ~800MB (under free tier)
- **CDN Bandwidth**: Photos served from Supabase CDN
- **Compute**: Serverless auto-scales

## Cost Analysis at Scale

### 10,000 Weddings/Year
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month  
- **Gemini AI**: ~$250/month ($0.075 per wedding)
- **Qdrant**: $65/month (paid tier)
- **Total**: ~$360/month ($0.43 per wedding)

### Break-even Analysis
- Need 36 weddings/month at $10/wedding
- Or 18 weddings/month at $20/wedding
- Very achievable for sustainability

## Recommendations

### Do Now ✅
1. Use database queue pattern for AI processing
2. Implement simple rate limiting
3. Add error retry logic
4. Monitor with Vercel Analytics

### Do Later (>100 weddings) 
1. Add Redis caching
2. Implement proper job queue
3. Separate AI processing service
4. Add APM monitoring

### Don't Do (Unless >10K weddings)
1. Microservices architecture
2. Kubernetes orchestration
3. Custom API gateway
4. Multi-region deployment

## Conclusion

The current Next.js + Supabase + Vercel architecture can handle **50x the maximum anticipated load** without any changes. The system is:

- **Simple**: One codebase, one deployment
- **Scalable**: Can grow to 10K weddings without re-architecture
- **Cost-effective**: <$0.50 per wedding at scale
- **Maintainable**: Standard Next.js patterns

Focus on features, not infrastructure. The architecture is already future-proof for realistic growth scenarios.