# Supabase Setup Implementation Plan

## Overview
Setting up Supabase for database, authentication, and storage for the Memory Album MVP.

## Manual Setup Required
You need to obtain these credentials from your Supabase project dashboard.

## Technical Approach

### 1. Database Schema
- Weddings table (multi-tenant)
- Memories table with photos relation
- Memory groups for AI organization
- Proper indexes for performance

### 2. Row Level Security (RLS)
- Public read for wedding memories
- Write access with rate limiting
- Admin access for wedding owners

### 3. Storage Buckets
- Public bucket for memory photos
- Organized by wedding_id/memory_id
- Image optimization policies

### 4. Client Configuration
- Singleton pattern for efficiency
- Type-safe database queries
- Error handling and retries

## Key Decisions
- Using RLS instead of custom auth for MVP
- Public bucket for photos (simpler for MVP)
- Storing embeddings separately in Qdrant

## Dependencies
- @supabase/supabase-js (already installed)
- Environment variables configured
- Database schema defined

## Success Criteria
- Database migrations applied successfully
- Storage bucket accepts photo uploads
- Client connects without errors
- Test data can be inserted and retrieved