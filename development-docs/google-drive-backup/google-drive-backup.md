# Google Drive Backup Feature

## Overview
Automatic backup of all wedding photos to the couple's Google Drive, providing permanent ownership and easy access to all memories.

## Current Status
✅ **OAuth Authentication**: Completed in Sprint 5 (wedding-config branch)
- Google OAuth flow implemented and tested
- Tokens stored in `wedding_google_drive` table
- Basic connection/disconnection working

⏳ **Backup Functionality**: Planned for Sprint 8
- Folder creation and management
- Automatic photo uploads
- Token refresh logic

## Architecture

### Database Schema
```sql
wedding_google_drive
├── id (UUID)
├── wedding_id (UUID) - Reference to wedding
├── google_email (TEXT) - Connected Google account
├── google_name (TEXT) - Account display name
├── access_token (TEXT) - For API calls (expires hourly)
├── refresh_token (TEXT) - For renewing access
├── token_expires_at (TIMESTAMPTZ) - Token expiry time
├── folder_id (TEXT) - Root folder ID in Drive
├── is_active (BOOLEAN) - Connection status
└── last_sync_at (TIMESTAMPTZ) - Last successful backup
```

### Folder Structure
```
📁 Memory Album - {wedding-slug}/
  📁 All Photos/
  📁 Bride Memories/
  📁 Groom Memories/
  📁 Together Memories/
```

## Implementation Plan

### Phase 1: OAuth Connection (✅ COMPLETED)
- OAuth 2.0 flow with Google
- Token storage in database
- Basic connection UI in wedding config

### Phase 2: Folder Management (Sprint 8)
1. **On OAuth Success**:
   - Create folder structure in Drive
   - Store root folder ID in database
   - Handle existing folders gracefully

2. **Folder Creation Service**:
   ```typescript
   createWeddingFolders(weddingSlug: string)
   detectExistingFolders(weddingSlug: string)
   getFolderIdForCategory(category: string)
   ```

### Phase 3: Photo Upload (Sprint 8)
1. **Upload Trigger**:
   - Guest submits memory with photos
   - Photo saved to Supabase Storage
   - Background job queued for Drive upload

2. **Upload Service**:
   ```typescript
   uploadPhoto(photoUrl: string, category: string)
   batchUploadPhotos(photos: Photo[])
   retryFailedUploads()
   ```

3. **Background Job**:
   - Run every 5 minutes via Vercel Cron
   - Process upload queue
   - Handle failures and retries

### Phase 4: Token Management (Sprint 8)
1. **Token Refresh**:
   - Check token expiry before API calls
   - Use refresh token to get new access token
   - Update database with new token

2. **Error Handling**:
   - Invalid refresh token → Mark connection inactive
   - API quota exceeded → Exponential backoff
   - Network errors → Retry queue

## API Endpoints

### Existing (Completed)
- `GET /api/auth/google?wedding={slug}` - Initiate OAuth
- `GET /api/auth/google/callback` - Handle OAuth callback

### Planned (Sprint 8)
- `POST /api/google-drive/sync` - Manual sync trigger
- `GET /api/google-drive/status` - Connection status
- `DELETE /api/google-drive/disconnect` - Revoke access
- `POST /api/google-drive/create-folders` - Initialize folders

## Technical Considerations

### Security
- Tokens should be encrypted at rest (future enhancement)
- Use service account for better security (enterprise feature)
- Implement rate limiting on API endpoints

### Performance
- Async uploads to not block user experience
- Batch API calls to reduce quota usage
- Implement smart caching for folder IDs

### Error Recovery
- Maintain upload queue in database
- Implement exponential backoff
- Send notifications for persistent failures
- Manual retry option in admin panel

### Google Drive API Limits
- **Quota**: 1 billion requests per day (plenty)
- **Rate Limit**: 1000 requests per 100 seconds per user
- **Upload Size**: 5TB per file (more than enough)

## User Experience

### For Couples
1. Click "Connect Google Drive" in settings
2. Authorize Memory Album
3. Photos automatically backup as guests submit
4. Access all photos in their Drive anytime
5. Disconnect anytime to stop backups

### For Guests
- No change - seamless experience
- Photos still upload to Memory Album normally
- Backup happens invisibly in background

## Testing Strategy

### Unit Tests
- Token refresh logic
- Folder creation logic
- Upload retry mechanism

### Integration Tests
- Full OAuth flow
- Photo upload to Drive
- Error handling scenarios

### Manual Testing
- Different Google accounts
- Large photo uploads
- Network interruptions
- Token expiry scenarios

## Dependencies

### Required Packages
```json
{
  "googleapis": "^118.0.0",  // Google APIs client
  "node-cron": "^3.0.0"      // For background jobs
}
```

### Environment Variables
```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_DRIVE_ENCRYPTION_KEY=xxx  # Future: for token encryption
```

## Rollout Plan

1. **Development Testing**: Test with single wedding
2. **Beta Testing**: Enable for select couples
3. **Gradual Rollout**: Enable for all new weddings
4. **Full Launch**: Offer to existing weddings

## Success Metrics

- OAuth connection success rate > 95%
- Photo upload success rate > 99%
- Average upload time < 30 seconds
- Zero data loss incidents
- User satisfaction score > 4.5/5

## Future Enhancements

1. **Advanced Organization**:
   - Organize by date/event
   - Smart albums using AI
   - Duplicate detection

2. **Sync Options**:
   - Selective sync (only favorites)
   - Compression options
   - Original quality preservation

3. **Sharing Features**:
   - Auto-share folder with spouse
   - Generate shareable links
   - Export to Google Photos

4. **Enterprise Features**:
   - Google Workspace integration
   - Team drives support
   - Advanced admin controls