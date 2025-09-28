import { createClient } from '@supabase/supabase-js'
// import { Database } from '@/types/supabase' // Type file doesn't exist yet

// Storage bucket names
export const STORAGE_BUCKETS = {
  WEDDING_PHOTOS: 'wedding-photos',
  MEMORY_PHOTOS: 'memory-photos',
} as const

// Storage configuration
export const STORAGE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  photoQuality: 0.85,
  thumbnailSize: { width: 300, height: 300 },
  fullSize: { width: 1920, height: 1920 },
} as const

/**
 * Initialize storage buckets in Supabase
 * Run this manually in Supabase SQL editor
 */
export const STORAGE_SETUP_SQL = `
-- Create wedding-photos bucket (public read)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types, file_size_limit)
VALUES (
  'wedding-photos',
  'wedding-photos', 
  true,
  false,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  10485760
) ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  file_size_limit = 10485760;

-- Create memory-photos bucket (public read)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types, file_size_limit)
VALUES (
  'memory-photos',
  'memory-photos',
  true,
  false,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  10485760
) ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  file_size_limit = 10485760;

-- RLS policies for wedding-photos bucket
CREATE POLICY "Give users access to own wedding folder" ON storage.objects
  FOR ALL USING (
    bucket_id = 'wedding-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public read access for wedding photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'wedding-photos');

-- RLS policies for memory-photos bucket  
CREATE POLICY "Anyone can upload memory photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'memory-photos');

CREATE POLICY "Public read access for memory photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'memory-photos');

-- Allow deletion of memory photos by wedding owners
CREATE POLICY "Wedding owners can delete memory photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'memory-photos' AND
    EXISTS (
      SELECT 1 FROM weddings 
      WHERE id::text = (storage.foldername(name))[1] 
      AND user_id = auth.uid()
    )
  );
`;

/**
 * Generate a unique filename for uploaded photos
 */
export function generatePhotoFilename(
  weddingId: string,
  originalFilename: string,
  prefix: 'memory' | 'wedding' = 'memory'
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg'
  return `${weddingId}/${prefix}_${timestamp}_${random}.${extension}`
}

/**
 * Get public URL for a photo
 */
export function getPhotoPublicUrl(
  supabaseUrl: string,
  bucket: keyof typeof STORAGE_BUCKETS,
  filepath: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKETS[bucket]}/${filepath}`
}

/**
 * Upload a photo to Supabase storage
 */
export async function uploadPhoto(
  supabase: any, // Accept any Supabase client type
  file: File,
  weddingId: string,
  bucket: keyof typeof STORAGE_BUCKETS = 'MEMORY_PHOTOS'
): Promise<{ path: string; publicUrl: string } | { error: string }> {
  // Validate file
  if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.type as any)) {
    return { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }
  }
  
  if (file.size > STORAGE_CONFIG.maxFileSize) {
    return { error: 'File too large. Maximum size is 10MB.' }
  }

  // Generate filename
  const filename = generatePhotoFilename(weddingId, file.name, bucket === 'WEDDING_PHOTOS' ? 'wedding' : 'memory')

  // Upload to storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Storage upload error:', error)
    return { error: error.message }
  }

  const publicUrl = getPhotoPublicUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    bucket,
    data.path
  )

  return { path: data.path, publicUrl }
}

/**
 * Delete a photo from storage
 */
export async function deletePhoto(
  supabase: any, // Accept any Supabase client type
  bucket: keyof typeof STORAGE_BUCKETS,
  filepath: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .remove([filepath])

  if (error) {
    console.error('Storage deletion error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * List photos in a wedding folder
 */
export async function listWeddingPhotos(
  supabase: any, // Accept any Supabase client type
  weddingId: string,
  bucket: keyof typeof STORAGE_BUCKETS = 'MEMORY_PHOTOS'
): Promise<{ files: Array<{ name: string; url: string }>; error?: string }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .list(weddingId, {
      limit: 1000,
      offset: 0,
    })

  if (error) {
    console.error('Storage list error:', error)
    return { files: [], error: error.message }
  }

  const files = (data || []).map((file: any) => ({
    name: file.name,
    url: getPhotoPublicUrl(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      bucket,
      `${weddingId}/${file.name}`
    )
  }))

  return { files }
}