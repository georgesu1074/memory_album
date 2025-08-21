-- Memory Album Database Schema
-- This is the source of truth for our database structure
-- Use this to regenerate the database or create new migrations

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Weddings table (multi-tenant root)
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  couple_names VARCHAR(255) NOT NULL,
  wedding_date DATE,
  venue VARCHAR(255),
  theme_color VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wedding guests
CREATE TABLE IF NOT EXISTS wedding_guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  table_number VARCHAR(20),
  is_attending BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wedding_id, email)
);

-- Categories for grouping memories by events
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  summary TEXT,
  memory_count INTEGER DEFAULT 0,
  keywords TEXT[],
  theme VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wedding_id, name)
);

-- Memories (main content table)
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255),
  memory_text TEXT NOT NULL,
  memory_type VARCHAR(50) NOT NULL CHECK (memory_type IN ('bride', 'groom', 'both')),
  
  -- Photo storage
  photo_urls TEXT[],
  photo_keys TEXT[],
  
  -- AI Categorization
  category VARCHAR(255),
  category_id UUID REFERENCES categories(id),
  category_confidence NUMERIC(3,2),
  categorization_metadata JSONB,
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'failed_permanent')
  ),
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory embeddings (for vector search)
CREATE TABLE IF NOT EXISTS memory_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  embedding_id VARCHAR(255), -- Qdrant point ID
  model_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(memory_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_memories_wedding_id ON memories(wedding_id);
CREATE INDEX IF NOT EXISTS idx_memories_status ON memories(status);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_category_id ON memories(category_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_processing ON memories(status) WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS idx_categories_wedding_id ON categories(wedding_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

CREATE INDEX IF NOT EXISTS idx_wedding_guests_wedding_id ON wedding_guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_email ON wedding_guests(email);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment category memory count
CREATE OR REPLACE FUNCTION increment_category_count(category_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE categories
  SET 
    memory_count = memory_count + 1,
    updated_at = NOW()
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

-- Recalculate category count (for fixing inconsistencies)
CREATE OR REPLACE FUNCTION recalculate_category_count(category_id UUID)
RETURNS void AS $$
DECLARE
  count_val INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_val
  FROM memories
  WHERE category_id = recalculate_category_count.category_id
    AND status = 'completed';
  
  UPDATE categories
  SET 
    memory_count = count_val,
    updated_at = NOW()
  WHERE id = recalculate_category_count.category_id;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all category counts for a wedding
CREATE OR REPLACE FUNCTION recalculate_all_category_counts(wedding_id UUID)
RETURNS void AS $$
DECLARE
  cat RECORD;
BEGIN
  FOR cat IN 
    SELECT id FROM categories WHERE wedding_id = recalculate_all_category_counts.wedding_id
  LOOP
    PERFORM recalculate_category_count(cat.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_weddings_updated_at 
  BEFORE UPDATE ON weddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at 
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_embeddings ENABLE ROW LEVEL SECURITY;

-- Policies will be added based on authentication strategy
-- For now, using service key bypasses RLS

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE weddings IS 'Multi-tenant root table for each wedding event';
COMMENT ON TABLE categories IS 'Event-based categories for grouping related memories';
COMMENT ON TABLE memories IS 'Guest-submitted memories with photos and AI categorization';
COMMENT ON TABLE memory_embeddings IS 'References to vector embeddings stored in Qdrant';

COMMENT ON COLUMN memories.category IS 'Category name (deprecated, use category_id)';
COMMENT ON COLUMN memories.category_id IS 'Reference to categories table';
COMMENT ON COLUMN memories.categorization_metadata IS 'AI categorization details: confidence, keywords, reasoning';
COMMENT ON COLUMN categories.summary IS 'AI-generated summary combining all memories in this category';
COMMENT ON COLUMN categories.memory_count IS 'Cached count of memories in this category';