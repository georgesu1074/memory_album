-- Migration: Set up storage buckets and RLS policies for photo uploads

-- Enable RLS on memory_photos table
ALTER TABLE memory_photos ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can insert memory photos
CREATE POLICY "Anyone can insert memory photos" ON memory_photos
  FOR INSERT 
  WITH CHECK (true);

-- Create policy: Anyone can view memory photos
CREATE POLICY "Anyone can view memory photos" ON memory_photos
  FOR SELECT
  USING (true);

-- Storage bucket setup (run in Supabase Dashboard -> Storage)
-- Note: These can't be run via migrations, must be done in Dashboard
/*
1. Go to Storage in Supabase Dashboard
2. Create bucket named 'memory-photos' with:
   - Public: true (for viewing)
   - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
   - Max file size: 10MB
*/

-- Storage policies for memory-photos bucket
-- These allow anyone to upload and view photos
-- Run these in SQL Editor after creating the bucket:
/*
-- Allow anyone to upload to memory-photos bucket
CREATE POLICY "Anyone can upload memory photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memory-photos'
  );

-- Allow anyone to view memory photos
CREATE POLICY "Anyone can view memory photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'memory-photos'
  );
*/