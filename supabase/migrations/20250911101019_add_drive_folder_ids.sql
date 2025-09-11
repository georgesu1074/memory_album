-- Add Google Drive folder IDs to wedding_google_drive table
ALTER TABLE wedding_google_drive 
  ADD COLUMN IF NOT EXISTS root_folder_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS photos_folder_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS bride_folder_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS groom_folder_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS together_folder_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_photos_uploaded INTEGER DEFAULT 0;

-- Create table for tracking individual photo uploads
CREATE TABLE IF NOT EXISTS memory_drive_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  drive_file_id VARCHAR(255),
  drive_folder_id VARCHAR(255),
  upload_status VARCHAR(50) DEFAULT 'pending', -- pending, uploading, completed, failed
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_memory_drive_uploads_memory_id ON memory_drive_uploads(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_drive_uploads_status ON memory_drive_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_memory_drive_uploads_created_at ON memory_drive_uploads(created_at);

-- Add RLS policies for memory_drive_uploads
ALTER TABLE memory_drive_uploads ENABLE ROW LEVEL SECURITY;

-- Only allow admin/service role to access upload tracking
CREATE POLICY "Service role can manage upload tracking"
  ON memory_drive_uploads
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE memory_drive_uploads IS 'Tracks Google Drive upload status for each photo';
COMMENT ON COLUMN memory_drive_uploads.upload_status IS 'Status of upload: pending, uploading, completed, failed';
COMMENT ON COLUMN memory_drive_uploads.retry_count IS 'Number of retry attempts for failed uploads';