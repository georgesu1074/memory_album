# Google Drive Integration Test Plan

## Test Environment Setup
- [ ] Server running at http://localhost:3002
- [ ] Database migrations applied (via `supabase db push`)
- [ ] Google OAuth credentials configured in `.env.local`
- [ ] Test wedding exists (e.g., sarah-john-wedding)

## Test Scenarios

### 1. Initial OAuth Connection
**Objective**: Verify Google OAuth flow and token storage

**Steps**:
1. [ ] Navigate to http://localhost:3002/sarah-john-wedding/config
2. [ ] Verify "Connect Google Drive" button appears in Quick Actions
3. [ ] Click "Connect Google Drive" button
4. [ ] Complete Google OAuth consent flow
5. [ ] Verify redirect back to config page with success message

**Expected Results**:
- [ ] Google Drive status card appears
- [ ] User's Google email is displayed
- [ ] Status shows as "Active" or "Setup Required"
- [ ] Manual Sync and Disconnect buttons are visible

**Database Verification**:
- [ ] Check `wedding_google_drive` table has new record
- [ ] Verify tokens are encrypted (not plain text)
- [ ] Verify `is_active` is true

---

### 2. Folder Structure Creation
**Objective**: Verify automatic Drive folder creation

**Steps**:
1. [ ] After OAuth connection, check Google Drive at https://drive.google.com
2. [ ] Look for folder "Memory Album - sarah-john-wedding"
3. [ ] Open the main folder

**Expected Results**:
- [ ] Main folder exists with correct naming
- [ ] Contains 4 subfolders:
  - [ ] All Photos
  - [ ] Bride Memories
  - [ ] Groom Memories
  - [ ] Together Memories

**Recovery Test** (if folders missing):
- [ ] Click "Setup Google Drive Folders" button on config page
- [ ] Verify folders are created
- [ ] Check database for folder IDs

---

### 3. Photo Upload Flow
**Objective**: Test automatic photo backup after memory submission

**Test A - Bride Memory**:
1. [ ] Navigate to http://localhost:3002/sarah-john-wedding
2. [ ] Click "Share a Memory"
3. [ ] Select "For the Bride"
4. [ ] Enter name: "Test User"
5. [ ] Enter memory text: "Test bride memory with photos"
6. [ ] Upload 2 test photos
7. [ ] Submit form

**Expected Results**:
- [ ] Memory submission successful
- [ ] Console shows: "[DRIVE] Queuing 2 photos for Drive upload"
- [ ] Within 30 seconds, photos appear in "Bride Memories" folder in Drive
- [ ] Upload Progress shows 2 completed uploads

**Test B - Groom Memory**:
1. [ ] Repeat above with "For the Groom" selection
2. [ ] Use different test photos

**Expected Results**:
- [ ] Photos appear in "Groom Memories" folder

**Test C - Both Memory**:
1. [ ] Repeat with "For Both" selection
2. [ ] Use different test photos

**Expected Results**:
- [ ] Photos appear in "Together Memories" folder

**Database Verification**:
- [ ] Check `memory_drive_uploads` table
- [ ] Verify records show status "completed"
- [ ] Verify `drive_file_id` is populated

---

### 4. Upload Status Display
**Objective**: Verify real-time upload progress tracking

**Steps**:
1. [ ] Return to config page after submitting memories
2. [ ] Observe Upload Progress card (if visible)
3. [ ] Check Google Drive Status card statistics

**Expected Results**:
- [ ] Upload Progress shows correct counts for:
  - [ ] Pending uploads
  - [ ] Completed uploads
  - [ ] Any failed uploads
- [ ] Recent activity list shows uploaded files
- [ ] Google Drive Status shows:
  - [ ] Updated "Photos Backed Up" count
  - [ ] Current "Last Sync" timestamp

---

### 5. Manual Sync Functionality
**Objective**: Test manual sync trigger for pending uploads

**Setup**:
1. [ ] Submit a new memory with photos
2. [ ] Immediately navigate to config page

**Steps**:
1. [ ] Click "Manual Sync" button
2. [ ] Wait for operation to complete

**Expected Results**:
- [ ] Button text changes to "Syncing..."
- [ ] Success message appears
- [ ] Upload count increases
- [ ] New photos appear in Drive

---

### 6. Token Validation
**Objective**: Verify token validation and auto-refresh

**Test via API**:
1. [ ] Open terminal
2. [ ] Run: `curl http://localhost:3002/api/weddings/sarah-john-wedding/drive/validate`

**Expected Results**:
- [ ] Response shows: `{"valid": true, "message": "Token is valid and Drive API is accessible"}`

**Long-running Test** (optional):
- [ ] Wait 1 hour
- [ ] Submit new memory with photos
- [ ] Verify upload still works (token auto-refreshed)

---

### 7. Disconnect and Reconnect
**Objective**: Test Drive disconnection and reconnection flow

**Disconnect Test**:
1. [ ] Click "Disconnect Drive" button on config page
2. [ ] Confirm the dialog

**Expected Results**:
- [ ] Success message appears
- [ ] Google Drive status card disappears
- [ ] "Connect Google Drive" button reappears

**Database Verification**:
- [ ] Check `wedding_google_drive.is_active` is false
- [ ] Verify tokens are cleared but metadata retained

**Reconnect Test**:
1. [ ] Click "Connect Google Drive" again
2. [ ] Complete OAuth flow

**Expected Results**:
- [ ] Previous folder structure is detected (not recreated)
- [ ] Upload history is preserved
- [ ] Previous statistics remain

---

### 8. Error Handling
**Objective**: Test upload failure recovery

**Simulate Failure**:
1. [ ] Submit memory with 3 photos
2. [ ] Quickly disconnect internet/WiFi
3. [ ] Wait 30 seconds
4. [ ] Reconnect internet

**Steps**:
1. [ ] Check Upload Progress for failed uploads
2. [ ] Click "Retry Failed Uploads" button

**Expected Results**:
- [ ] Failed count shows in Upload Progress
- [ ] Retry button appears
- [ ] After retry, uploads complete successfully
- [ ] Photos eventually appear in Drive

---

### 9. Edge Cases

**Test A - Duplicate Prevention**:
1. [ ] Click Manual Sync twice rapidly

**Expected Results**:
- [ ] No duplicate uploads created
- [ ] Second sync reports "0 photos queued"

**Test B - Large Photo Upload**:
1. [ ] Submit memory with 5 high-resolution photos (>5MB each)

**Expected Results**:
- [ ] All photos upload successfully
- [ ] No timeouts occur

**Test C - Special Characters**:
1. [ ] Submit memory with photos having special characters in filename

**Expected Results**:
- [ ] Photos upload without errors
- [ ] Filenames are sanitized appropriately

---

## Performance Checks

- [ ] OAuth flow completes in < 5 seconds
- [ ] Folder creation completes in < 3 seconds
- [ ] Photo uploads start within 10 seconds of submission
- [ ] Status updates reflect within 5 seconds
- [ ] Manual sync completes in < 10 seconds

## Security Verification

- [ ] Tokens in database are encrypted (not readable)
- [ ] No tokens visible in browser console/network tab
- [ ] Disconnect properly clears sensitive data
- [ ] API endpoints require valid wedding slug

## Final Checklist

- [ ] All test scenarios pass
- [ ] No console errors during testing
- [ ] Database records are consistent
- [ ] Google Drive has all expected files
- [ ] UI displays accurate information
- [ ] Error cases handled gracefully