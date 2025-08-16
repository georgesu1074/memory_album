# Memory Album - Deployment & Scaling Strategy

## Deployment Overview

### Architecture (Simplified)
- **Full Stack**: Next.js on Vercel (frontend + API routes)
- **Database**: Supabase (managed PostgreSQL + Storage)
- **Vector DB**: Qdrant Cloud
- **AI**: Google Gemini API
- **Backup**: Google Drive API
- **Background Jobs**: Vercel Cron Jobs

## Environment Setup

### Development
```bash
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_KEY=...
QDRANT_URL=https://...qdrant.io
QDRANT_API_KEY=...
GEMINI_API_KEY=...
GOOGLE_DRIVE_CREDENTIALS=...
JWT_SECRET=...
```

### Production
All secrets stored in:
- Vercel Environment Variables (all services)
- GitHub Secrets (for CI/CD)

## Deployment Pipeline

### Vercel Deployment (Everything)

#### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set custom domain
vercel domains add memories.love
```

#### Automatic Deployment
- Push to `main` branch → Production
- Push to `develop` branch → Preview
- PR → Preview deployment with unique URL

#### Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/weddings/[wedding_slug]/memories/route.ts": {
      "maxDuration": 30
    }
  }
}
```

#### Vercel Cron Jobs
```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 2 * * *"  // Daily at 2 AM
    },
    {
      "path": "/api/cron/generate-embeddings",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}
```

### Database (Supabase)

#### Setup
1. Create project at app.supabase.com
2. Run migrations:
```bash
# Using Supabase CLI
supabase init
supabase db push

# Or direct SQL
psql $DATABASE_URL < schema.sql
```

#### Migrations
```bash
# Create migration
supabase migration new add_wedding_features

# Apply migration
supabase db push
```

### Vector DB (Qdrant Cloud)

#### Setup
1. Create cluster at cloud.qdrant.io
2. Initialize collections:
```python
from qdrant_client import QdrantClient

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

# Create collection for each wedding
client.create_collection(
    collection_name=f"wedding_{wedding_id}",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
)
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: |
          pip install poetry
          poetry install
          poetry run pytest

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/railway-action@v1
        with:
          service_token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring & Observability

### Application Monitoring
- **Frontend**: Vercel Analytics + Web Vitals
- **Backend**: Railway Metrics Dashboard
- **Errors**: Sentry (free tier - 5k events/month)

### Setup Sentry
```python
# Backend
import sentry_sdk
sentry_sdk.init(
    dsn="your-dsn",
    environment="production",
    traces_sample_rate=0.1
)

# Frontend
import * as Sentry from "@sentry/nextjs"
Sentry.init({
  dsn: "your-dsn",
  environment: "production",
  tracesSampleRate: 0.1
})
```

### Health Checks
```python
# Backend health endpoint
@app.get("/health")
async def health():
    checks = {
        "database": await check_database(),
        "qdrant": await check_qdrant(),
        "storage": await check_storage()
    }
    
    if all(checks.values()):
        return {"status": "healthy", "checks": checks}
    else:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "checks": checks}
        )
```

### Logging
```python
# Structured logging
import structlog

logger = structlog.get_logger()

logger.info("memory_submitted", 
    wedding_id=wedding_id,
    guest_name=guest_name,
    memory_type=memory_type
)
```

## Scaling Strategy

### Phase 1: MVP (Your Wedding)
- **Traffic**: 200 guests, 1000 requests/day
- **Infrastructure**:
  - Vercel: Free tier
  - Railway: Free tier ($5 credit)
  - Supabase: Free tier
  - Qdrant: Free tier

### Phase 2: Early Adopters (10 weddings/month)
- **Traffic**: 2000 guests, 10k requests/day
- **Infrastructure**:
  - Vercel: Pro ($20/month)
  - Railway: Hobby ($5/month)
  - Supabase: Pro ($25/month)
  - Qdrant: Free tier still works

### Phase 3: Growth (100 weddings/month)
- **Traffic**: 20k guests, 100k requests/day
- **Infrastructure**:
  - Vercel: Pro
  - Railway: Pro ($20/month) + Redis
  - Supabase: Pro + extra storage
  - Qdrant: Starter ($19/month)

### Phase 4: Scale (1000+ weddings/month)
- **Traffic**: 200k guests, 1M requests/day
- **Infrastructure Changes**:
  - Add CDN (Cloudflare)
  - Move to AWS/GCP for backend
  - Implement caching layer
  - Database read replicas
  - Queue system for AI processing

## Performance Optimization

### Frontend
```javascript
// Next.js optimizations
module.exports = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

### Backend
```python
# Caching with Redis
from redis import asyncio as aioredis

redis = aioredis.from_url(REDIS_URL)

@cached(ttl=300)  # 5 min cache
async def get_memories(wedding_id: str):
    return await db.fetch_memories(wedding_id)
```

### Database
```sql
-- Connection pooling
DATABASE_URL = "postgresql://...?pool_size=20&max_overflow=40"

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM memories WHERE wedding_id = '...';
```

## Disaster Recovery

### Backup Schedule
- **Database**: Daily automated, 30-day retention
- **Photos**: Real-time to Google Drive
- **Vectors**: Weekly export to S3

### Recovery Procedures
1. **Database Failure**:
   - Restore from Supabase point-in-time recovery
   - Failover to read replica (if available)

2. **Service Outage**:
   - Railway auto-restarts on failure
   - Vercel auto-failover to edge locations

3. **Data Corruption**:
   - Restore from latest backup
   - Replay events from audit log

### RTO/RPO Targets
- **Recovery Time Objective**: 1 hour
- **Recovery Point Objective**: 1 hour

## Security Measures

### Infrastructure Security
- HTTPS everywhere (SSL/TLS)
- Environment variables for secrets
- Network isolation for database
- Rate limiting on all endpoints

### Application Security
```python
# Input validation
from pydantic import BaseModel, validator

class MemorySubmission(BaseModel):
    content: str
    
    @validator('content')
    def validate_content(cls, v):
        if len(v) < 10 or len(v) > 1000:
            raise ValueError('Content must be 10-1000 characters')
        return v

# SQL injection prevention (using ORM)
memory = await db.memories.find_first(
    where={"wedding_id": wedding_id}
)

# XSS prevention (automatic in React)
<div>{sanitizedContent}</div>
```

### Compliance
- GDPR: Data export/deletion available
- CCPA: California privacy compliance
- Photos: User consent for storage

## Cost Management

### Cost Monitoring
```python
# Track API usage
async def track_api_usage(endpoint: str, cost: float):
    await analytics.track({
        "event": "api_usage",
        "endpoint": endpoint,
        "cost": cost
    })
```

### Cost Optimization
- Use Gemini Flash for matching (10x cheaper)
- Resize images before storage
- Cache aggressively
- Batch AI operations

### Monthly Budget Alerts
- Set up alerts at 50%, 80%, 100% of budget
- Auto-scale down if over budget
- Queue non-critical operations

## Launch Checklist

### Pre-Launch
- [ ] Domain configured (memories.love)
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Security scan passed

### Launch Day
- [ ] Enable production mode
- [ ] Monitor metrics dashboard
- [ ] Check error rates
- [ ] Verify photo uploads
- [ ] Test AI processing
- [ ] Monitor costs

### Post-Launch
- [ ] Gather user feedback
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Update documentation
- [ ] Plan next features