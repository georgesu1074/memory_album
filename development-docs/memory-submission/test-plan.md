# Memory Submission - Test Plan

## Test Environment
- URL: http://localhost:3003/test-wedding-2024
- Browser: Chrome/Safari (mobile and desktop)
- Test Data: Existing wedding with guest list

## Test Scenarios

### 1. Modal Functionality
- [ ] Click "Share Memory" button opens modal
- [ ] Click X button closes modal
- [ ] Click backdrop closes modal
- [ ] Modal is scrollable on small screens
- [ ] Floating action button visible on mobile

### 2. Form Validation
- [ ] Cannot submit without guest name
- [ ] Cannot submit without memory text
- [ ] Character counter updates correctly
- [ ] Maximum 1000 characters enforced
- [ ] Memory type selection works (Bride/Groom/Both)

### 3. Guest Selection
- [ ] Dropdown shows all guests when clicked
- [ ] Typing filters guest list
- [ ] Can select a guest from dropdown
- [ ] Can enter manual name if not in list
- [ ] Selected guest shows checkmark

### 4. Memory Submission
- [ ] Submit button shows loading state
- [ ] Error message displays on failure
- [ ] Success screen shows after submission
- [ ] Memory appears in list immediately
- [ ] Form resets after submission

### 5. Share Another Flow
- [ ] "Share Another Memory" button works
- [ ] Form is cleared for new entry
- [ ] Previous submission remains in list
- [ ] Can submit multiple memories in sequence

### 6. Data Persistence
- [ ] Refresh page - memories persist
- [ ] Check database - memory saved correctly
- [ ] Guest ID linked when selected from list
- [ ] Guest name saved for manual entries

### 7. Mobile Experience
- [ ] Form is usable on iPhone/Android
- [ ] Keyboard doesn't cover inputs
- [ ] Scrolling works within modal
- [ ] Touch interactions work properly

## Known Limitations
- Photo upload UI exists but doesn't save to storage yet
- No rate limiting implemented
- No profanity filtering

## Test Results
Document any issues found during testing below: