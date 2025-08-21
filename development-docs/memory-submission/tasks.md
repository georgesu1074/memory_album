# Memory Submission Tasks

## Sprint 2: Core Memory Submission Flow
**Goal**: Guests can submit memories with photos

### Epic: Memory Submission UI

- [x] Create mobile-first submission form component
- [x] Add memory type selector (Bride/Groom/Both)
- [x] Create guest name search dropdown with autocomplete
- [x] Build textarea with character counter
- [x] Implement photo upload component with preview
- [x] Add client-side form validation
- [x] Create submission loading states
- [x] Build success confirmation screen
- [x] Add "Share Another" flow
- [x] Implement error handling UI

### Epic: Memory Submission API

- [x] Create GET /api/weddings/[slug]/guests/search endpoint
- [x] Create POST /api/weddings/[slug]/memories endpoint
- [x] Implement multipart form data parsing
- [x] Add server-side validation
- [x] Upload photos to Supabase Storage
- [ ] Implement photo resizing/optimization
- [x] Create memory record in database
- [ ] Add rate limiting (10/min per IP)
- [ ] Implement error logging
- [x] Add success response with memory ID

## Progress
- **Completed**: 18/20 tasks (90%)
- **Status**: Photo upload to Supabase Storage implemented!
- **Remaining**: Rate limiting and error logging (nice-to-have features)