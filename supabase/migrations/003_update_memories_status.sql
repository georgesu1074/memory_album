-- Migration: Replace is_processed with status for better async job handling
-- This prevents race conditions when multiple workers process memories

-- Drop the old column and add the new status column
ALTER TABLE memories 
  DROP COLUMN IF EXISTS is_processed,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

-- Add timestamp tracking for processing
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Create index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_memories_status ON memories(status);

-- Update any existing records (if they exist)
UPDATE memories 
SET status = 'completed' 
WHERE ai_category IS NOT NULL;

-- Add comment explaining the status field
COMMENT ON COLUMN memories.status IS 'Tracks memory processing state: pending (just submitted), processing (AI categorization in progress), completed (categorized), failed (processing error)';