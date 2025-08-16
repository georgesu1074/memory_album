# Supabase Database Setup Guide

## Quick Setup Steps

Since the Supabase JavaScript client doesn't support direct SQL execution, you'll need to run the migrations manually through the Supabase dashboard.

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://bramtdzshmewknjqddrt.supabase.co
2. Click on "SQL Editor" in the left sidebar

### Step 2: Run Database Schema
1. Click "New Query"
2. Copy the entire contents of `/lib/database.sql`
3. Paste into the SQL editor
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### Step 3: Run RLS Policies
1. Click "New Query" again
2. Copy the entire contents of `/lib/database-rls.sql`
3. Paste into the SQL editor
4. Click "Run"
5. You should see "Success. No rows returned"

### Step 4: Set Up Storage Buckets
1. Go to "Storage" in the left sidebar
2. Click "New Bucket"
3. Create a bucket named: `memory-photos`
   - Public bucket: Yes (check the box)
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
4. Click "Save"

### Step 5: Verify Setup
Run `npm run test:connection` to verify everything is working.

## Storage Bucket Policies (Optional)

If you want more control over storage access, you can add these RLS policies to the storage bucket:

```sql
-- Allow public to upload photos
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'memory-photos');

-- Allow public to view photos
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'memory-photos');
```

## Troubleshooting

If you see any errors:
1. Make sure you're in the SQL Editor, not the Table Editor
2. Check that you're running the queries one at a time
3. If a table already exists, you can drop it first with: `DROP TABLE IF EXISTS table_name CASCADE;`
4. Check the "Logs" section in Supabase dashboard for detailed error messages