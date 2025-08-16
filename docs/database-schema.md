# Memory Album - Database Schema

## Database: PostgreSQL (Supabase)

## Tables

### weddings
Primary table for multi-tenant support.

```sql
CREATE TABLE weddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  couple_names VARCHAR(200) NOT NULL,
  wedding_date DATE,
  theme_color VARCHAR(7) DEFAULT '#ec4899',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_weddings_slug ON weddings(slug);
```

### wedding_guests
Guest list for dropdown selection during memory submission.

```sql
CREATE TABLE wedding_guests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email VARCHAR(255), -- Optional, for future auth
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_wedding_guests_wedding_id ON wedding_guests(wedding_id);
CREATE INDEX idx_wedding_guests_full_name ON wedding_guests(full_name);
```

### memories
Core table for individual memory submissions.

```sql
CREATE TABLE memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES wedding_guests(id),
  guest_name VARCHAR(100), -- Fallback for non-listed guests
  memory_text TEXT NOT NULL,
  memory_type VARCHAR(20) CHECK (memory_type IN ('bride', 'groom', 'both')) DEFAULT 'both',
  group_id UUID,
  is_processed BOOLEAN DEFAULT false,
  ai_category VARCHAR(100),
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_memories_wedding_id ON memories(wedding_id);
CREATE INDEX idx_memories_guest_id ON memories(guest_id);
CREATE INDEX idx_memories_group_id ON memories(group_id);
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);
```

### memory_photos
Photo attachments for memories (up to 5 per submission).

```sql
CREATE TABLE memory_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  mime_type VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_memory_photos_memory_id ON memory_photos(memory_id);
```

### memory_groups
AI-generated groupings of related memories.

```sql
CREATE TABLE memory_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  memory_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_memory_groups_wedding_id ON memory_groups(wedding_id);
```

### memory_embeddings
Metadata for vector embeddings stored in Qdrant.

```sql
CREATE TABLE memory_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  qdrant_point_id UUID NOT NULL,
  embedding_model VARCHAR(100) DEFAULT 'text-embedding-004',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE UNIQUE INDEX idx_memory_embeddings_memory_id ON memory_embeddings(memory_id);
```

---

## Functions & Triggers

### Update timestamp trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_groups_updated_at BEFORE UPDATE ON memory_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_guests_updated_at BEFORE UPDATE ON wedding_guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_embeddings ENABLE ROW LEVEL SECURITY;

-- Weddings policies
CREATE POLICY "Public can view active weddings" ON weddings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role manages weddings" ON weddings
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Wedding guests policies
CREATE POLICY "Public can view wedding guests" ON wedding_guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = wedding_guests.wedding_id
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Service role manages guests" ON wedding_guests
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Memories policies
CREATE POLICY "Public can view memories from active weddings" ON memories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = memories.wedding_id
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Public can create memories for active weddings" ON memories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = memories.wedding_id
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Service role manages memories" ON memories
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Memory photos policies
CREATE POLICY "Public can view memory photos" ON memory_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memories
      JOIN weddings ON weddings.id = memories.wedding_id
      WHERE memories.id = memory_photos.memory_id
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Public can add photos to memories" ON memory_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories
      JOIN weddings ON weddings.id = memories.wedding_id
      WHERE memories.id = memory_photos.memory_id
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Service role manages photos" ON memory_photos
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Memory groups policies
CREATE POLICY "Public can view memory groups" ON memory_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = memory_groups.wedding_id
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Service role manages groups" ON memory_groups
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Memory embeddings policies (service role only)
CREATE POLICY "Service role manages embeddings" ON memory_embeddings
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## Storage Buckets (Supabase Storage)

```sql
-- Create storage bucket for photos
-- Configured via Supabase Dashboard:
-- Name: memory-photos
-- Public: Yes
-- Max file size: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

-- Storage policies
CREATE POLICY "Public can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'memory-photos');

CREATE POLICY "Public can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'memory-photos');
```

---

## Key Design Decisions

### Multi-Tenancy
- Each wedding is isolated by `wedding_id`
- RLS policies ensure guests only see active weddings
- All queries filtered by wedding context

### Guest Management
- `wedding_guests` table for pre-populated guest list
- Guests select from dropdown during submission
- Fallback `guest_name` field for unlisted guests
- Email field reserved for future authentication

### Memory Organization
- Individual memories stored separately
- AI groups related memories via `group_id`
- Photos linked to specific memories
- Embeddings stored in Qdrant, referenced in PostgreSQL

### Performance Optimization
- Indexes on foreign keys and commonly queried fields
- JSONB metadata for flexible additional data
- Generated columns for computed values (full_name)
- Timestamp triggers for automatic updates

### Data Integrity
- CASCADE deletes to maintain referential integrity
- CHECK constraints for valid enum values
- UNIQUE constraints where appropriate
- NOT NULL for required fields

---

## Migration Strategy

### Phase 1 - MVP
1. Create all tables with current schema
2. Enable RLS policies
3. Create storage bucket
4. Test with single wedding

### Phase 2 - RAG Features
1. Start using memory_embeddings table
2. Implement vector search queries
3. No schema changes needed

### Phase 3 - Multi-Tenant
1. Add payment/subscription tables
2. Add admin authentication
3. Enhance wedding configuration

### Phase 4 - Scale
1. Add table partitioning for large tables
2. Implement read replicas
3. Add caching layer

---

## Backup Strategy

### Automated
- Supabase daily backups (7 day retention)
- Point-in-time recovery available

### Manual
- Weekly exports to Google Drive
- CSV exports of guest lists
- JSON exports of memories

### Data Retention
- Active weddings: Indefinite
- Inactive weddings: 1 year
- Embeddings: Kept as long as memories exist