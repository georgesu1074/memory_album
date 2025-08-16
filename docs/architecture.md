# Memory Album - Architecture Design

## Overview
A multi-tenant wedding memory collection platform where guests share memories and photos that are automatically organized using AI. Built as an MVP with clear paths to scale.

## Core Principles
- **Multi-tenant by design**: Easy to spin up new weddings
- **MVP-focused**: Ship fast, iterate based on feedback
- **Mobile-first**: 95% of usage will be on phones
- **No auth for guests**: Frictionless experience
- **Future-ready**: Collect embeddings now, build features later

## System Architecture

```
┌─────────────────────────┐
│   Next.js Full Stack    │
│      (Vercel)           │
│   • Frontend            │
│   • API Routes          │  
└───────────┬─────────────┘
            │
    ┌───────┴────┬──────────┬─────────┬─────────┐
    ▼            ▼          ▼         ▼         ▼
┌────────┐┌──────────┐┌────────┐┌────────┐┌────────┐
│Supabase││  Gemini  ││ Qdrant ││ Google ││Vercel  │
│(DB+Stor)││   (AI)   ││(Vector)││ Drive  ││  Cron  │
└────────┘└──────────┘└────────┘└────────┘└────────┘
           Phase 1:     Phase 1:
           Categorize   Store only
                       (use in Phase 2)
```

## Multi-Tenant Design

### URL Structure
- `memories.love/{wedding-slug}` - Guest facing
- `memories.love/{wedding-slug}/album` - View memories
- `memories.love/admin` - Wedding couple admin (with auth)

### Tenant Isolation
- Each wedding has unique `wedding_id` (UUID)
- All data partitioned by `wedding_id`
- Vector namespaces in Qdrant per wedding
- Separate Google Drive folders per wedding

## Tech Stack

### Frontend & Backend - Next.js 14 (Full Stack)
- **Why**: Single deployment, reduced complexity, excellent DX
- **Deployment**: Vercel (automatic from GitHub)
- **Key Libraries**:
  - Tailwind CSS - rapid mobile UI
  - Framer Motion - smooth animations
  - React Query - data fetching
  - Zustand - simple state management
  - Next.js API Routes - backend logic

### Database - Supabase
- **Why**: Postgres + Storage + Realtime in one
- **Usage**:
  - PostgreSQL for structured data
  - Storage for photos (3GB free)
  - Realtime for live memory updates

### Vector DB - Qdrant Cloud
- **Why**: Best dev experience, generous free tier
- **Phase 1**: Store embeddings only (data collection)
- **Phase 2**: Enable search & RAG features
- **Usage**:
  - Namespace per wedding
  - Store text & image embeddings
  - Future: Semantic search, similarity matching

### AI - Google Gemini
- **Why**: Best value - 10x cheaper than alternatives, massive context windows
- **Models**:
  - Gemini 2.0 Flash - memory categorization ($0.075/M input, 1M context)
  - Gemini 1.5 Pro - summary generation ($1.25/M input, 2M context)
  - text-embedding-004 - create embeddings (FREE!)
- **Total cost for 200-guest wedding**: <$3

## Data Flow

### Memory Submission (Phase 1)
1. Guest submits memory + photos via Next.js form
2. API route validates and processes
3. Upload photos to Supabase Storage
4. Call Gemini to categorize memory (function calling with existing memories)
5. If match: append to existing memory
6. If new: create new memory
7. Generate embedding and store in Qdrant (for future use)
8. Trigger AI summary update (async)
9. Return success to frontend

### Memory Viewing
1. Frontend requests memories for wedding
2. API route fetches from Supabase
3. Return paginated memories with summaries
4. Lazy load full journal entries on expand

## Caching Strategy
- Memory list: 5 min cache (Next.js Data Cache)
- Individual memories: 1 min cache
- Photos: CDN cached via Vercel/Supabase
- Embeddings: Stored in Qdrant (not queried in Phase 1)

## Security Considerations
- Rate limiting per IP (10 submissions/min)
- File size limits (10MB per photo)
- Content moderation via Gemini safety filters
- Admin routes require JWT auth
- CORS restricted to production domain

## Performance Targets
- Memory submission: <2s
- Memory list load: <500ms
- Photo upload: <5s for 3 photos
- AI summary generation: <3s (async)

## Monitoring
- Vercel Analytics - frontend metrics
- Railway metrics - backend performance
- Supabase dashboard - DB performance
- Error tracking via Sentry (free tier)

## Disaster Recovery
- Daily Supabase backups
- Google Drive sync for photos
- Qdrant cloud backups
- Export function for couples

## Development Phases

### Phase 1 - MVP (Your Wedding)
**Core Features:**
- Memory submission with photos
- AI categorization (Gemini function calling)
- Basic memory album view
- Store embeddings in Qdrant (not used yet)
- Google Drive backup

**Tech Decisions:**
- Single Vercel deployment
- Gemini for categorization (no vector search)
- Collect embeddings for future use

### Phase 2 - RAG Features
**Unlock Vector DB:**
- Semantic memory search
- Similar memory discovery
- Image similarity search
- Memory recommendations
- Auto-tagging from embeddings

**Potential Features:**
- "Find all beach memories"
- "Show photos with dancing"
- Memory timeline visualization
- Guest relationship mapping

### Phase 3 - Multi-tenant Product
**Productization:**
- Wedding creation flow
- Admin dashboard
- Custom wedding slugs
- Pricing/payments
- Analytics dashboard

### Phase 4 - Advanced Features
**Scale & Enhancement:**
- Cross-wedding insights
- AI-generated wedding books
- Video message support
- Real-time collaborative features
- Advanced moderation

## Cost Projections
### Phase 1 - MVP (Your Wedding - 200 guests)
- Vercel: Free tier
- Supabase: Free tier
- Qdrant: Free tier (1GB = 1M vectors)
- Gemini API: ~$5
- **Total: <$10**

### Phase 2 - With RAG (10 weddings/month)
- Vercel: Free-$20/month
- Supabase: $25/month
- Qdrant: Free tier (still under 1GB)
- Gemini API: ~$50/month
- **Total: ~$75-95/month**

### Phase 3 - Scale (100 weddings/month)
- Vercel: Pro $20/month
- Supabase: Pro $25/month + storage
- Qdrant: $19/month (4GB)
- Gemini API: ~$200/month
- **Total: ~$300/month**

## Development Timeline
- Week 1: Core backend + database
- Week 2: Frontend + memory submission
- Week 3: AI integration + album view
- Week 4: Polish + testing
- Week 5: Multi-tenant support
- Week 6: Admin dashboard