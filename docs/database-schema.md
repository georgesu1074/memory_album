# Memory Album - Database Schema

## Database: PostgreSQL (Supabase)

## Tables

### weddings
Primary table for multi-tenant support.

```sql
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  couple_names VARCHAR(200) NOT NULL,
  wedding_date DATE,
  admin_email VARCHAR(255) NOT NULL,
  theme_color VARCHAR(7) DEFAULT '#8B5CF6',
  google_drive_folder_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weddings_slug ON weddings(slug);
CREATE INDEX idx_weddings_active ON weddings(is_active);
```

### memories
Core table for memory groups.

```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('bride', 'groom', 'both')),
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  summary_version INTEGER DEFAULT 1,
  embedding_id VARCHAR(100), -- Qdrant vector ID
  photo_count INTEGER DEFAULT 0,
  entry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_memories_wedding ON memories(wedding_id);
CREATE INDEX idx_memories_type ON memories(wedding_id, type);
CREATE INDEX idx_memories_updated ON memories(last_updated DESC);
```

### journal_entries
Individual guest submissions.

```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true, -- For moderation
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_entries_memory ON journal_entries(memory_id);
CREATE INDEX idx_entries_wedding ON journal_entries(wedding_id);
CREATE INDEX idx_entries_visible ON journal_entries(is_visible);
```

### photos
Photo storage references.

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
  storage_path VARCHAR(500) NOT NULL, -- Supabase storage path
  public_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_photos_wedding ON photos(wedding_id);
CREATE INDEX idx_photos_memory ON photos(memory_id);
CREATE INDEX idx_photos_entry ON photos(journal_entry_id);
```

### admin_users
Simple admin access control.

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'owner' CHECK (role IN ('owner', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wedding_id, email)
);

CREATE INDEX idx_admin_wedding ON admin_users(wedding_id);
CREATE INDEX idx_admin_email ON admin_users(email);
```

### analytics_events
Track guest interactions for insights.

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'memory_submitted', 'photo_uploaded', 'page_view'
  guest_identifier VARCHAR(100), -- IP hash or session ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_wedding ON analytics_events(wedding_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- Partition by month for scaling
CREATE TABLE analytics_events_2024_03 PARTITION OF analytics_events
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
```

### export_jobs
Track data export requests.

```sql
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  format VARCHAR(10) NOT NULL CHECK (format IN ('json', 'pdf')),
  file_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_exports_wedding ON export_jobs(wedding_id);
CREATE INDEX idx_exports_status ON export_jobs(status);
```

---

## Views

### memory_summaries
Aggregated view for memory lists.

```sql
CREATE VIEW memory_summaries AS
SELECT 
  m.id,
  m.wedding_id,
  m.type,
  m.title,
  m.summary,
  m.photo_count,
  m.entry_count,
  m.last_updated,
  ARRAY_AGG(
    DISTINCT p.thumbnail_url 
    ORDER BY p.uploaded_at DESC
    LIMIT 3
  ) as preview_photos
FROM memories m
LEFT JOIN photos p ON p.memory_id = m.id
GROUP BY m.id;
```

### wedding_stats
Analytics dashboard view.

```sql
CREATE VIEW wedding_stats AS
SELECT 
  w.id as wedding_id,
  w.slug,
  COUNT(DISTINCT m.id) as total_memories,
  COUNT(DISTINCT je.id) as total_entries,
  COUNT(DISTINCT p.id) as total_photos,
  COUNT(DISTINCT je.guest_name) as unique_guests,
  MAX(je.submitted_at) as last_activity
FROM weddings w
LEFT JOIN memories m ON m.wedding_id = w.id
LEFT JOIN journal_entries je ON je.wedding_id = w.id
LEFT JOIN photos p ON p.wedding_id = w.id
GROUP BY w.id;
```

---

## Functions & Triggers

### Update timestamp trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weddings_timestamp
  BEFORE UPDATE ON weddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_memories_timestamp
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Update memory counts
```sql
CREATE OR REPLACE FUNCTION update_memory_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE memories 
    SET 
      entry_count = entry_count + 1,
      last_updated = NOW()
    WHERE id = NEW.memory_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE memories 
    SET 
      entry_count = entry_count - 1,
      last_updated = NOW()
    WHERE id = OLD.memory_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memory_entry_count
  AFTER INSERT OR DELETE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_counts();
```

### Update photo counts
```sql
CREATE OR REPLACE FUNCTION update_photo_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.memory_id IS NOT NULL THEN
    UPDATE memories 
    SET photo_count = photo_count + 1
    WHERE id = NEW.memory_id;
  ELSIF TG_OP = 'DELETE' AND OLD.memory_id IS NOT NULL THEN
    UPDATE memories 
    SET photo_count = photo_count - 1
    WHERE id = OLD.memory_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memory_photo_count
  AFTER INSERT OR DELETE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_counts();
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Public read access for active weddings
CREATE POLICY "Public read active weddings" ON weddings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read memories" ON memories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weddings 
      WHERE weddings.id = memories.wedding_id 
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Public read visible entries" ON journal_entries
  FOR SELECT USING (
    is_visible = true AND
    EXISTS (
      SELECT 1 FROM weddings 
      WHERE weddings.id = journal_entries.wedding_id 
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Public read photos" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weddings 
      WHERE weddings.id = photos.wedding_id 
      AND weddings.is_active = true
    )
  );

-- Guest insert policies
CREATE POLICY "Guests can submit entries" ON journal_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings 
      WHERE weddings.id = journal_entries.wedding_id 
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Guests can upload photos" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings 
      WHERE weddings.id = photos.wedding_id 
      AND weddings.is_active = true
    )
  );
```

---

## Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_memories_wedding_type_updated 
  ON memories(wedding_id, type, last_updated DESC);

CREATE INDEX idx_entries_memory_visible_submitted 
  ON journal_entries(memory_id, is_visible, submitted_at DESC);

CREATE INDEX idx_photos_memory_uploaded 
  ON photos(memory_id, uploaded_at DESC);

-- Text search indexes (future feature)
CREATE INDEX idx_entries_content_search 
  ON journal_entries USING gin(to_tsvector('english', content));

CREATE INDEX idx_memories_title_search 
  ON memories USING gin(to_tsvector('english', title));
```

---

## Storage Buckets (Supabase Storage)

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('wedding-photos', 'wedding-photos', true),
  ('exports', 'exports', false);

-- Storage policies
CREATE POLICY "Public read wedding photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-photos');

CREATE POLICY "Guests can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wedding-photos' AND
    (storage.foldername(name))[1] IN (
      SELECT slug FROM weddings WHERE is_active = true
    )
  );
```

---

## Migration Strategy

### Initial Setup (V1)
1. Create weddings table
2. Create memories and related tables
3. Set up RLS policies
4. Create storage buckets

### Future Migrations
- V2: Add payment tables for monetization
- V3: Add theme customization tables
- V4: Add notification preferences
- V5: Add collaborative features

---

## Backup Strategy

### Automated Backups
- Supabase daily backups (7 day retention)
- Point-in-time recovery available

### Manual Exports
- Weekly JSON exports to Google Drive
- Monthly full database dumps

### Data Retention
- Active weddings: Indefinite
- Inactive weddings: 1 year
- Analytics: 6 months (aggregated monthly)