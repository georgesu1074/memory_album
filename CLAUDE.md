# Memory Album Project Context

## Project Overview
This is a multi-tenant wedding memory collection platform where guests share memories and photos that are automatically organized using AI.

## Key Decisions Made

### Architecture
- **Single Vercel deployment** (Next.js full stack)
- **Supabase** for database and storage
- **Qdrant** for vector storage (collect embeddings in Phase 1, use in Phase 2)
- **Google Gemini** for AI (cheapest option at <$3 per wedding)

### Development Phases
1. **Phase 1 - MVP**: Your wedding, basic features, store embeddings
2. **Phase 2 - RAG**: Enable vector search features
3. **Phase 3 - Multi-tenant**: Productize for other weddings
4. **Phase 4 - Scale**: Advanced features

### Tech Stack Rationale
- **Why Gemini**: 10x cheaper than Claude, free embeddings
- **Why Vercel-only**: Simpler deployment, everything in one place
- **Why store embeddings now**: Free at this scale, enables future features without migration

### Cost Analysis
- Your wedding: <$3 total
- 10 weddings/month: ~$75/month
- 100 weddings/month: ~$300/month

### Documents Created
All documentation is in `/docs` directory:
- `architecture.md` - System design
- `api-design.md` - API endpoints
- `database-schema.md` - PostgreSQL schema
- `deployment-strategy.md` - Deployment guide
- `rag-features.md` - Future RAG features
- `ai-cost-comparison.md` - Detailed AI pricing analysis

## Next Steps
1. Initialize Next.js project
2. Set up Supabase
3. Create basic UI for memory submission
4. Implement Gemini categorization
5. Set up Qdrant for embedding storage
6. Build memory album view
7. Add Google Drive backup

## Important Context from Previous Discussion

### Multi-Tenant Strategy
- Each wedding gets a unique slug: `memories.love/{wedding-slug}`
- All data partitioned by `wedding_id`
- Separate Qdrant namespaces per wedding

### MVP Features for Your Wedding
- Memory submission with photos
- AI categorization (not using vectors yet)
- Basic album view
- Google Drive backup
- Store embeddings for future use

### Why We're Storing Embeddings Without Using Them
- Essentially free at wedding scale
- No migration needed later
- Can enable RAG features instantly in Phase 2
- Good learning opportunity

### Key Technical Decisions
- Use Next.js API routes (not separate backend)
- Use Gemini function calling for categorization (not vector search)
- Store up to 5 photos per memory submission
- Generate summaries asynchronously
- Use Vercel Cron for background jobs

## Development Commands
```bash
# When ready to start development
cd /Users/georgesu/projects/memory_album
npx create-next-app@latest . --typescript --tailwind --app
npm install @supabase/supabase-js
npm install qdrant-js
npm install @google/generative-ai
```

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
QDRANT_URL=
QDRANT_API_KEY=
GEMINI_API_KEY=
GOOGLE_DRIVE_CREDENTIALS=
JWT_SECRET=
```

## Questions Resolved
- ✅ RAG needed? No for MVP, but store embeddings anyway
- ✅ Separate backend? No, use Next.js API routes
- ✅ Which AI model? Gemini (cheapest with free embeddings)
- ✅ Vector DB worth it? Yes, free tier covers thousands of weddings

---

Note: This project was renamed from `wedding_site` to `memory_album` to better reflect its purpose as a platform for multiple weddings, not just a single site.