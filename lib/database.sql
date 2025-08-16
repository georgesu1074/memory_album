-- Memory Album Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Weddings table (multi-tenant root)
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

-- Create index on slug for fast lookups
CREATE INDEX idx_weddings_slug ON weddings(slug);

-- Memories table
CREATE TABLE memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
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

-- Create indexes for queries
CREATE INDEX idx_memories_wedding_id ON memories(wedding_id);
CREATE INDEX idx_memories_group_id ON memories(group_id);
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);

-- Memory photos table
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

-- Create index for photo queries
CREATE INDEX idx_memory_photos_memory_id ON memory_photos(memory_id);

-- Memory groups table (for AI grouping)
CREATE TABLE memory_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  memory_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for group queries
CREATE INDEX idx_memory_groups_wedding_id ON memory_groups(wedding_id);

-- Embeddings metadata table (for Qdrant reference)
CREATE TABLE memory_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  qdrant_point_id UUID NOT NULL,
  embedding_model VARCHAR(100) DEFAULT 'text-embedding-004',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create unique index to prevent duplicate embeddings
CREATE UNIQUE INDEX idx_memory_embeddings_memory_id ON memory_embeddings(memory_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_groups_updated_at BEFORE UPDATE ON memory_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();