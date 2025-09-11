# Sprint 6: Google Drive Backup Implementation - Tasks

## Status
- Sprint: 6
- Started: 2025-01-11
- Status: In Progress

## Task Checklist

### Epic: Folder Management
- [x] Create wedding folder structure on OAuth connection
  - Main folder: "Memory Album - {wedding-slug}"
  - Subfolders: All Photos, Bride Memories, Groom Memories, Together Memories
- [x] Store folder IDs in database
- [x] Handle existing folder detection
- [x] Add folder creation retry logic

### Epic: Photo Upload Integration
- [x] Implement Google Drive service class
- [x] Add photo upload functionality
  - Upload to correct category subfolder
  - Handle large files with resumable uploads
  - Add retry logic for failed uploads
- [x] Create background job for async uploads
- [x] Queue photos for upload after guest submission
- [x] Track upload status in database

### Epic: Token Management
- [x] Implement access token refresh logic
- [x] Handle expired tokens gracefully
- [x] Add token encryption for security
- [x] Create token validation endpoint
- [x] Add automatic token refresh before expiry

### Epic: UI/UX Improvements
- [x] Show Google Drive connection status
- [x] Display connected Google account email
- [x] Add disconnect/reconnect functionality
- [x] Show upload progress/status
- [x] Add manual sync button
- [x] Create upload history log

### Epic: Error Handling & Recovery
- [ ] Handle Google Drive API quota limits
- [ ] Implement exponential backoff for retries
- [ ] Add fallback for failed uploads
- [ ] Create admin notification for failures
- [ ] Add manual retry mechanism

## Progress
- [ ] 0/20 tasks completed
- Current Epic: Folder Management
- Next Task: Create wedding folder structure on OAuth connection