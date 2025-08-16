# Memory Album - API Design

## Base URL Structure
- Production: `https://memories.love/api`
- Development: `http://localhost:3000/api`

## API Implementation
- All endpoints implemented as Next.js API Routes
- Located in `app/api/` directory
- Full TypeScript support
- Runs on Vercel Edge Runtime where applicable

## Authentication
- **Guest endpoints**: No auth required
- **Admin endpoints**: JWT Bearer token
- **Wedding identification**: Via `wedding_slug` or `wedding_id` in URL

---

## Guest Endpoints (No Auth)

### Get Wedding Info
```
GET /api/weddings/[wedding_slug]

Response 200:
{
  "wedding_id": "uuid",
  "slug": "george-and-sarah-2024",
  "couple_names": "George & Sarah",
  "wedding_date": "2024-06-15",
  "theme_color": "#8B5CF6",
  "is_active": true
}
```

### Search Wedding Guests
```
GET /api/weddings/[wedding_slug]/guests/search?q={query}

Query Params:
- q: string (min 2 chars) - Search by first or last name

Response 200:
{
  "guests": [
    {
      "id": "uuid",
      "full_name": "John Smith",
      "first_name": "John",
      "last_name": "Smith"
    },
    {
      "id": "uuid", 
      "full_name": "Jane Doe",
      "first_name": "Jane",
      "last_name": "Doe"
    }
  ]
}

Note: Returns up to 20 matches, ordered alphabetically
```

### Submit Memory
```
POST /api/weddings/[wedding_slug]/memories

Request (multipart/form-data):
{
  "type": "both" | "bride" | "groom",
  "guest_id": "uuid", // If selected from guest list
  "guest_name": "John Smith", // Fallback if not in list
  "content": "I remember when George tried to serenade Sarah...",
  "photos": [File, File, ...] // max 5 photos, 10MB each
}

Response 201:
{
  "memory_id": "uuid",
  "is_new_memory": true,
  "matched_memory_id": null | "uuid",
  "message": "Thank you for sharing your memory!"
}

Rate Limit: 10 requests per minute per IP
```

### List Memories
```
GET /api/weddings/[wedding_slug]/memories?type={type}&page={page}&limit={limit}

Query Params:
- type: "all" | "both" | "bride" | "groom" (default: "all")
- page: integer (default: 1)
- limit: integer (default: 12, max: 50)

Response 200:
{
  "memories": [
    {
      "id": "uuid",
      "type": "both",
      "title": "The Karaoke Night",
      "summary": "A legendary night of terrible singing...",
      "photo_count": 5,
      "entry_count": 3,
      "last_updated": "2024-03-15T10:30:00Z",
      "preview_photos": ["url1", "url2", "url3"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total_pages": 5,
    "total_items": 58
  }
}
```

### Get Memory Details
```
GET /api/weddings/[wedding_slug]/memories/[memory_id]

Response 200:
{
  "id": "uuid",
  "type": "both",
  "title": "The Karaoke Night",
  "summary": "Multiple friends recall the legendary karaoke night...",
  "created_at": "2024-03-15T08:00:00Z",
  "last_updated": "2024-03-15T12:00:00Z",
  "journal_entries": [
    {
      "id": "uuid",
      "guest_name": "John Smith",
      "content": "George's rendition of Bohemian Rhapsody...",
      "submitted_at": "2024-03-15T08:00:00Z",
      "photos": ["url1", "url2"]
    }
  ],
  "all_photos": ["url1", "url2", "url3", "url4", "url5"]
}
```

### Upload Status (WebSocket)
```
WS /api/weddings/[wedding_slug]/live

// Server sends updates when new memories are added
{
  "type": "new_memory",
  "memory_id": "uuid",
  "memory_type": "both",
  "title": "New Memory Added"
}
```

---

## Admin Endpoints (Auth Required)

### Create Wedding
```
POST /api/admin/weddings

Headers:
Authorization: Bearer {jwt_token}

Request:
{
  "slug": "george-and-sarah-2024",
  "couple_names": "George & Sarah",
  "wedding_date": "2024-06-15",
  "admin_email": "george@example.com",
  "theme_color": "#8B5CF6",
  "google_drive_folder_id": "optional_drive_id"
}

Response 201:
{
  "wedding_id": "uuid",
  "slug": "george-and-sarah-2024",
  "admin_token": "jwt_token",
  "public_url": "https://memories.love/george-and-sarah-2024"
}
```

### Update Wedding
```
PATCH /api/admin/weddings/[wedding_id]

Headers:
Authorization: Bearer {jwt_token}

Request:
{
  "is_active": false,
  "theme_color": "#FF6B6B"
}

Response 200:
{
  "message": "Wedding updated successfully"
}
```

### Get Wedding Analytics
```
GET /api/admin/weddings/[wedding_id]/analytics

Headers:
Authorization: Bearer {jwt_token}

Response 200:
{
  "total_memories": 45,
  "total_entries": 123,
  "total_photos": 234,
  "unique_guests": 67,
  "memories_by_type": {
    "both": 20,
    "bride": 15,
    "groom": 10
  },
  "recent_activity": [
    {
      "timestamp": "2024-03-15T10:30:00Z",
      "guest_name": "John Smith",
      "action": "submitted_memory"
    }
  ]
}
```

### Export Wedding Data
```
POST /api/admin/weddings/[wedding_id]/export

Headers:
Authorization: Bearer {jwt_token}

Request:
{
  "format": "json" | "pdf",
  "include_photos": true
}

Response 202:
{
  "export_id": "uuid",
  "status": "processing",
  "estimated_time": 60
}
```

### Backup to Google Drive
```
POST /api/admin/weddings/[wedding_id]/backup

Headers:
Authorization: Bearer {jwt_token}

Response 202:
{
  "message": "Backup initiated",
  "backup_id": "uuid"
}
```

### Moderate Content
```
DELETE /api/admin/memories/[memory_id]/entries/[entry_id]

Headers:
Authorization: Bearer {jwt_token}

Response 200:
{
  "message": "Entry removed successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "validation_error",
  "message": "Invalid request data",
  "details": {
    "field": "content",
    "issue": "Content must be between 10 and 1000 characters"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Wedding not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred",
  "request_id": "uuid"
}
```

---

## Request/Response Headers

### Standard Request Headers
```
Content-Type: application/json | multipart/form-data
Accept: application/json
X-Request-ID: uuid (optional, for tracking)
```

### Standard Response Headers
```
Content-Type: application/json
X-Request-ID: uuid
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1616161616
```

---

## File Upload Specifications

### Photo Requirements
- **Formats**: JPEG, PNG, WebP, HEIC
- **Max size**: 10MB per file
- **Max files**: 5 per submission
- **Auto-processing**: Resize to max 2048px width, optimize quality

### Photo Response URLs
- Signed URLs valid for 7 days
- CDN cached for performance
- Multiple sizes available: `?width=200`, `?width=800`, `?width=1600`

---

## API Rate Limits

### Guest Endpoints
- Memory submission: 10/minute per IP
- Memory listing: 60/minute per IP
- Memory details: 60/minute per IP

### Admin Endpoints
- All endpoints: 100/minute per token

---

## Webhook Events (Future)

### Event Types
- `memory.created` - New memory created
- `memory.updated` - Memory summary updated
- `entry.added` - New journal entry added
- `backup.completed` - Google Drive backup finished

### Webhook Payload
```json
{
  "event": "memory.created",
  "wedding_id": "uuid",
  "data": {
    "memory_id": "uuid",
    "type": "both"
  },
  "timestamp": "2024-03-15T10:30:00Z"
}
```