# Memory Submission Tasks

## Sprint 2: Core Memory Submission Flow
**Goal**: Guests can submit memories with photos

### Epic: Memory Submission UI

- [ ] Create mobile-first submission form component
- [ ] Add memory type selector (Bride/Groom/Both)
- [ ] Create guest name search dropdown with autocomplete
- [ ] Build textarea with character counter
- [ ] Implement photo upload component with preview
- [ ] Add client-side form validation
- [ ] Create submission loading states
- [ ] Build success confirmation screen
- [ ] Add "Share Another" flow
- [ ] Implement error handling UI

### Epic: Memory Submission API

- [ ] Create GET /api/weddings/[slug]/guests/search endpoint
- [ ] Create POST /api/weddings/[slug]/memories endpoint
- [ ] Implement multipart form data parsing
- [ ] Add server-side validation
- [ ] Upload photos to Supabase Storage
- [ ] Implement photo resizing/optimization
- [ ] Create memory record in database
- [ ] Add rate limiting (10/min per IP)
- [ ] Implement error logging
- [ ] Add success response with memory ID

## Progress
- **Completed**: 0/20 tasks (0%)
- **Status**: Starting
- **Next Task**: Create mobile-first submission form component