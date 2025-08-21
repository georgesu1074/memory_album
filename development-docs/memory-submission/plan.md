# Memory Submission UI - Implementation Plan

## Overview
Build the guest-facing memory submission interface with mobile-first design, guest selection dropdown, photo upload, and real-time validation.

## Technical Approach
- Mobile-first responsive design using Tailwind CSS
- React Hook Form for form management
- Supabase client for database operations
- Client-side image optimization before upload
- Searchable dropdown using guest list from database

## Key Components
1. **Memory Submission Form**
   - Memory type selector (radio buttons)
   - Guest name search dropdown
   - Memory text area with character counter
   - Photo upload with preview
   - Submit button with loading state

2. **Guest Search Component**
   - Searchable dropdown with autocomplete
   - Fetches from wedding_guests table
   - Fallback for manual entry
   - Debounced search

3. **Photo Upload Component**
   - Drag and drop interface
   - Multiple file selection (max 5)
   - Image preview thumbnails
   - Client-side compression
   - Progress indicators

## Dependencies
- react-hook-form: Form validation and management
- react-select: Searchable dropdown component
- react-dropzone: Drag and drop file upload
- browser-image-compression: Client-side image optimization

## API Endpoints
- GET /api/weddings/[slug]/guests/search - Search guests
- POST /api/weddings/[slug]/memories - Submit memory
- POST /api/upload - Handle photo uploads

## Success Criteria
- Works perfectly on mobile devices
- Guest search is fast and intuitive
- Photos upload reliably
- Form validation provides clear feedback
- Accessible to all users

## Notes
- Consider offline support for poor connections
- Implement optimistic UI updates
- Add analytics tracking for submissions
- Schema updated: `is_processed` → `status` field for better async job handling (migration pending)