-- Add categorization fields to memories table
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS category VARCHAR(255),
ADD COLUMN IF NOT EXISTS category_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS categorization_metadata JSONB,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Update status check constraint to include new status
ALTER TABLE memories 
DROP CONSTRAINT IF EXISTS memories_status_check;

ALTER TABLE memories
ADD CONSTRAINT memories_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'failed_permanent'));

-- Add index for category queries
CREATE INDEX IF NOT EXISTS idx_memories_category 
ON memories(wedding_id, category) 
WHERE category IS NOT NULL;

-- Update index for status queries (for retry mechanism)
DROP INDEX IF EXISTS idx_memories_status;
CREATE INDEX idx_memories_status_retry 
ON memories(wedding_id, status, retry_count) 
WHERE status IN ('pending', 'failed');

-- Add comment for documentation
COMMENT ON COLUMN memories.category IS 'Event-based category for grouping related memories';
COMMENT ON COLUMN memories.category_confidence IS 'AI confidence score for categorization (0-1)';
COMMENT ON COLUMN memories.categorization_metadata IS 'JSON metadata about categorization decision';