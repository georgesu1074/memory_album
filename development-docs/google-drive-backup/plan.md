# Google Drive Backup Implementation Plan

## Overview
Complete the Google Drive integration to automatically backup wedding photos and memories. OAuth is already set up and tokens are stored in the database from Sprint 5.

## Current Status
- ✅ OAuth flow implemented
- ✅ Tokens stored in `wedding_google_drive` table
- ✅ Redirect URIs configured
- ⏳ Need to implement actual Drive API integration
- ⏳ Need folder structure creation
- ⏳ Need photo upload functionality

## Technical Architecture

### 1. Google Drive Service (`/lib/google/drive-service.ts`)
- Singleton service for all Drive operations
- Token refresh management
- Folder operations (create, find, list)
- File upload with resumable uploads
- Error handling and retries

### 2. Database Schema Updates
```sql
-- Add to wedding_google_drive table
ALTER TABLE wedding_google_drive ADD COLUMN IF NOT EXISTS 
  root_folder_id VARCHAR(255),
  photos_folder_id VARCHAR(255),
  bride_folder_id VARCHAR(255),
  groom_folder_id VARCHAR(255),
  together_folder_id VARCHAR(255),
  last_sync_at TIMESTAMPTZ,
  total_photos_uploaded INTEGER DEFAULT 0;

-- New table for tracking uploads
CREATE TABLE memory_drive_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id),
  photo_url TEXT,
  drive_file_id VARCHAR(255),
  drive_folder_id VARCHAR(255),
  upload_status VARCHAR(50), -- pending, uploading, completed, failed
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ
);
```

### 3. Folder Structure
```
Memory Album - {wedding-slug}/
├── All Photos/
├── Bride Memories/
├── Groom Memories/
└── Together Memories/
```

### 4. Upload Flow
1. Guest submits memory with photos
2. Photos saved to Supabase Storage (existing)
3. Queue Drive upload job (new)
4. Background job processes upload
5. Upload to appropriate folder based on memory type
6. Track status in database
7. Handle retries if needed

### 5. API Endpoints

#### POST `/api/weddings/[slug]/drive/setup`
- Creates folder structure
- Stores folder IDs
- Called after OAuth connection

#### POST `/api/weddings/[slug]/drive/sync`
- Manual sync trigger
- Uploads any pending photos
- Returns sync status

#### GET `/api/weddings/[slug]/drive/status`
- Returns connection status
- Shows upload statistics
- Lists recent uploads

#### DELETE `/api/weddings/[slug]/drive/disconnect`
- Removes Drive connection
- Cleans up tokens
- Preserves upload history

### 6. Implementation Order
1. **Drive Service Class** - Core functionality
2. **Database Migrations** - Schema updates
3. **Folder Creation** - On OAuth callback
4. **Upload Queue** - After memory submission
5. **Background Job** - Process uploads
6. **UI Components** - Status display
7. **Error Handling** - Retries and recovery

## Security Considerations
- Encrypt tokens at rest
- Validate token expiry before operations
- Rate limit Drive API calls
- Implement proper error boundaries
- Log all operations for audit

## Testing Strategy
1. Unit tests for Drive service
2. Integration tests with mock Drive API
3. Manual testing with test wedding
4. Load testing with multiple uploads
5. Error scenario testing

## Success Metrics
- All photos backed up within 5 minutes
- Zero data loss
- Automatic retry on failures
- Clear status visibility
- Easy disconnect/reconnect